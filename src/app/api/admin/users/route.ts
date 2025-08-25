import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAbility } from "@/lib/ability";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import {
  GetUsersParams,
  UsersResponse,
  UserManagementErrorCodes,
  User,
  UserRole,
  PaginationParams,
  CreateUserRequest,
  UserMutationResponse,
  ApiErrorResponse,
  ErrorSeverity,
  EnhancedApiErrorResponse,
  USER_VALIDATION_RULES,
  PAGINATION_LIMITS,
} from "@/types/user";

// Enhanced helper function to get order by clause with null handling
function getOrderBy(
  sortBy?: string,
  sortOrder?: string
): Prisma.UserOrderByWithRelationInput[] {
  const order =
    sortOrder === "asc" ? Prisma.SortOrder.asc : Prisma.SortOrder.desc;

  switch (sortBy) {
    case "full_name":
      return [{ first_name: order }, { last_name: order }];
    case "email":
      return [{ email: order }];
    case "last_login":
      return [{ last_login: order }];
    case "role":
      return [
        { role: { name: order } },
        { first_name: Prisma.SortOrder.asc }, // Secondary sort for consistency
      ];
    case "status":
      return [
        { is_active: order },
        { first_name: Prisma.SortOrder.asc }, // Secondary sort
      ];
    case "activity_status":
      return [{ last_login: order }, { first_name: Prisma.SortOrder.asc }];
    case "created_at":
    default:
      return [{ created_at: order }];
  }
}

// Enhanced error response helper
function createErrorResponse(
  error: string,
  code: UserManagementErrorCodes,
  status: number,
  details?: unknown,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): NextResponse {
  const errorResponse: EnhancedApiErrorResponse = {
    error,
    code,
    details,
    timestamp: new Date().toISOString(),
    severity,
    userMessage: error,
    technicalMessage: typeof details === "string" ? details : undefined,
  };

  return new NextResponse(JSON.stringify(errorResponse), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Enhanced validation helper
function validatePaginationParams(params: GetUsersParams): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (params.page && (params.page < 1 || !Number.isInteger(params.page))) {
    errors.push("Page must be a positive integer");
  }

  if (
    params.pageSize &&
    (params.pageSize < PAGINATION_LIMITS.MIN_PAGE_SIZE ||
      params.pageSize > PAGINATION_LIMITS.MAX_PAGE_SIZE ||
      !Number.isInteger(params.pageSize))
  ) {
    errors.push(
      `Page size must be between ${PAGINATION_LIMITS.MIN_PAGE_SIZE} and ${PAGINATION_LIMITS.MAX_PAGE_SIZE}`
    );
  }

  // Validate date formats
  if (params.dateFrom) {
    const date = new Date(params.dateFrom);
    if (isNaN(date.getTime())) {
      errors.push("Invalid dateFrom format");
    }
  }

  if (params.dateTo) {
    const date = new Date(params.dateTo);
    if (isNaN(date.getTime())) {
      errors.push("Invalid dateTo format");
    }
  }

  // Validate sort parameters
  const validSortFields = [
    "full_name",
    "email",
    "created_at",
    "last_login",
    "role",
    "status",
    "activity_status",
  ];
  if (params.sortBy && !validSortFields.includes(params.sortBy)) {
    errors.push(
      `Invalid sortBy field. Must be one of: ${validSortFields.join(", ")}`
    );
  }

  if (params.sortOrder && !["asc", "desc"].includes(params.sortOrder)) {
    errors.push("Invalid sortOrder. Must be 'asc' or 'desc'");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Enhanced helper function to transform user data with better type safety
function transformUser(user: any): User {
  const age = user.birthday
    ? Math.floor(
        (Date.now() - new Date(user.birthday).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : undefined;

  // Determine activity status based on last login
  let activity_status: "online" | "offline" | "never" = "never";
  if (user.last_login) {
    const lastLoginTime = new Date(user.last_login).getTime();
    const now = Date.now();
    const timeDiff = now - lastLoginTime;

    // Consider user online if last login was within 5 minutes
    // This is a simplified approach - in production you'd track active sessions
    if (timeDiff < 5 * 60 * 1000) {
      activity_status = "online";
    } else {
      activity_status = "offline";
    }
  }

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    is_active: user.is_active,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
    last_login: user.last_login?.toISOString(),
    last_logout: user.last_logout?.toISOString(),
    avatar: user.avatar,
    sex: user.sex,
    birthday: user.birthday?.toISOString(),
    address: user.address,
    remember_token: user.remember_token,
    slack_webhook_url: user.slack_webhook_url,
    deleted_at: user.deleted_at?.toISOString(),
    coin: user.coin?.toString(), // Convert BigInt to string
    locale: user.locale,
    group_id: user.group_id,
    role_id: user.role_id,
    role: user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.permissions || [],
          description: user.role.description,
        }
      : undefined,
    // Computed fields
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    display_name: `${user.first_name} ${user.last_name}`.trim(),
    status: user.is_active ? "active" : "inactive",
    activity_status,
    age,
  };
}

// GET /api/admin/users - Enhanced with advanced filtering and pagination
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse(
        "Authentication required",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        401,
        "No valid session found",
        ErrorSeverity.HIGH
      );
    }

    const ability = createAbility(session);

    // Check if user has permission to read users
    if (ability.cannot("read", "User")) {
      return createErrorResponse(
        "Insufficient permissions to read users",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        403,
        "User lacks 'read' permission for 'User' resource",
        ErrorSeverity.HIGH
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const params: GetUsersParams = {
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(
        searchParams.get("pageSize") ||
          PAGINATION_LIMITS.DEFAULT_PAGE_SIZE.toString()
      ),
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      status:
        (searchParams.get("status") as "active" | "inactive" | "all") ||
        undefined,
      sortBy: searchParams.get("sortBy") || "created_at",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      activityDateFrom: searchParams.get("activityDateFrom") || undefined,
      activityDateTo: searchParams.get("activityDateTo") || undefined,
      hasAvatar:
        searchParams.get("hasAvatar") === "true"
          ? true
          : searchParams.get("hasAvatar") === "false"
          ? false
          : undefined,
      locale: searchParams.get("locale") || undefined,
      group_id: searchParams.get("group_id")
        ? parseInt(searchParams.get("group_id")!)
        : undefined,
      activity_status:
        (searchParams.get("activity_status") as
          | "online"
          | "offline"
          | "never") || undefined,
    };

    // Validate parameters
    const validation = validatePaginationParams(params);
    if (!validation.isValid) {
      return createErrorResponse(
        "Invalid request parameters",
        UserManagementErrorCodes.INVALID_PAGINATION_PARAMS,
        400,
        { errors: validation.errors },
        ErrorSeverity.MEDIUM
      );
    }

    // Apply default values and constraints
    params.page = Math.max(1, params.page || 1);
    params.pageSize = Math.min(
      PAGINATION_LIMITS.MAX_PAGE_SIZE,
      Math.max(
        PAGINATION_LIMITS.MIN_PAGE_SIZE,
        params.pageSize || PAGINATION_LIMITS.DEFAULT_PAGE_SIZE
      )
    );

    // Build enhanced where clause with comprehensive filtering
    const where: Prisma.UserWhereInput = {};
    const conditions: Prisma.UserWhereInput[] = [];

    // Enhanced search across multiple fields with better text matching
    if (params.search && params.search.trim()) {
      const searchTerm = params.search.trim();
      conditions.push({
        OR: [
          {
            first_name: {
              contains: searchTerm,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            last_name: {
              contains: searchTerm,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            email: { contains: searchTerm, mode: Prisma.QueryMode.insensitive },
          },
          // Search in full name (concatenated) - only if search has multiple words
          ...(searchTerm.split(" ").length > 1
            ? [
                {
                  AND: [
                    {
                      first_name: {
                        contains: searchTerm.split(" ")[0],
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                    {
                      last_name: {
                        contains: searchTerm.split(" ").slice(1).join(" "),
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  ],
                },
              ]
            : []),
        ],
      });
    }

    // Role filter with validation
    if (params.role && params.role !== "all") {
      // Validate role exists
      const roleExists = await prisma.role.findUnique({
        where: { id: params.role },
        select: { id: true },
      });

      if (!roleExists) {
        return createErrorResponse(
          "Invalid role filter",
          UserManagementErrorCodes.INVALID_ROLE,
          400,
          `Role with ID '${params.role}' does not exist`,
          ErrorSeverity.MEDIUM
        );
      }

      conditions.push({ role_id: params.role });
    }

    // Enhanced status filter
    if (params.status && params.status !== "all") {
      conditions.push({ is_active: params.status === "active" });
    }

    // Creation date range filter
    if (params.dateFrom || params.dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (params.dateFrom) {
        dateFilter.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        // Include the entire day for dateTo
        const endDate = new Date(params.dateTo);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.lte = endDate;
      }
      conditions.push({ created_at: dateFilter });
    }

    // Activity date range filter (last login)
    if (params.activityDateFrom || params.activityDateTo) {
      const activityFilter: Prisma.DateTimeNullableFilter = {};
      if (params.activityDateFrom) {
        activityFilter.gte = new Date(params.activityDateFrom);
      }
      if (params.activityDateTo) {
        const endDate = new Date(params.activityDateTo);
        endDate.setHours(23, 59, 59, 999);
        activityFilter.lte = endDate;
      }
      conditions.push({ last_login: activityFilter });
    }

    // Avatar filter
    if (params.hasAvatar !== undefined) {
      if (params.hasAvatar) {
        conditions.push({ avatar: { not: null } });
      } else {
        conditions.push({ avatar: null });
      }
    }

    // Locale filter
    if (params.locale && params.locale !== "all") {
      conditions.push({ locale: params.locale });
    }

    // Group filter
    if (params.group_id !== undefined) {
      conditions.push({ group_id: params.group_id });
    }

    // Activity status filter (requires special handling)
    if (params.activity_status) {
      switch (params.activity_status) {
        case "never":
          conditions.push({ last_login: null });
          break;
        case "online":
          // Users who logged in within the last 5 minutes
          conditions.push({
            last_login: {
              gte: new Date(Date.now() - 5 * 60 * 1000),
            },
          });
          break;
        case "offline":
          // Users who have logged in but not recently
          conditions.push({
            AND: [
              { last_login: { not: null } },
              {
                last_login: {
                  lt: new Date(Date.now() - 5 * 60 * 1000),
                },
              },
            ],
          });
          break;
      }
    }

    // Combine all conditions
    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Execute optimized queries in parallel for better performance
    const [users, total, roleStats, availableRoles] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          is_active: true,
          created_at: true,
          updated_at: true,
          last_login: true,
          last_logout: true,
          avatar: true,
          sex: true,
          birthday: true,
          address: true,
          remember_token: true,
          deleted_at: true,
          coin: true,
          locale: true,
          group_id: true,
          role_id: true,
          slack_webhook_url: true,
          role: {
            select: {
              id: true,
              name: true,
              permissions: true,
              description: true,
            },
          },
        },
        orderBy: getOrderBy(params.sortBy, params.sortOrder),
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.user.count({ where }),
      // Get role statistics for metadata
      prisma.user.groupBy({
        by: ["role_id", "is_active"],
        where,
        _count: {
          id: true,
        },
      }),
      // Get available roles for filter options
      prisma.role.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: {
              users: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    // Transform users data with enhanced error handling
    const transformedUsers = users.map((user) => {
      try {
        return transformUser(user);
      } catch (error) {
        console.error(`Error transforming user ${user.id}:`, error);
        // Return a minimal user object to prevent complete failure
        return {
          ...user,
          full_name: `${user.first_name} ${user.last_name}`,
          display_name: `${user.first_name} ${user.last_name}`,
          status: user.is_active ? "active" : "inactive",
          activity_status: user.last_login ? "offline" : "never",
          coin: user.coin?.toString(),
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
          last_login: user.last_login?.toISOString(),
          last_logout: user.last_logout?.toISOString(),
          birthday: user.birthday?.toISOString(),
          deleted_at: user.deleted_at?.toISOString(),
        } as User;
      }
    });

    // Calculate enhanced pagination metadata
    const totalPages = Math.ceil(total / params.pageSize);
    const startIndex = total > 0 ? (params.page - 1) * params.pageSize + 1 : 0;
    const endIndex = Math.min(params.page * params.pageSize, total);

    const pagination: PaginationParams = {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
      startIndex,
      endIndex,
    };

    // Calculate enhanced metadata from role statistics
    const activeUsers = roleStats
      .filter((stat) => stat.is_active)
      .reduce((sum, stat) => sum + stat._count.id, 0);
    const inactiveUsers = roleStats
      .filter((stat) => !stat.is_active)
      .reduce((sum, stat) => sum + stat._count.id, 0);
    const neverLoggedIn = transformedUsers.filter(
      (u) => u.activity_status === "never"
    ).length;

    // Calculate average last login (for users who have logged in)
    const usersWithLogin = transformedUsers.filter((u) => u.last_login);
    const averageLastLogin =
      usersWithLogin.length > 0
        ? new Date(
            usersWithLogin.reduce(
              (sum, u) => sum + new Date(u.last_login!).getTime(),
              0
            ) / usersWithLogin.length
          ).toISOString()
        : "N/A";

    // Find most common role with safe handling
    const roleCounts = roleStats.reduce((acc, stat) => {
      const roleId = stat.role_id || "no_role";
      acc[roleId] = (acc[roleId] || 0) + stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    let mostCommonRole = "USER"; // Default value
    const roleEntries = Object.entries(roleCounts);

    if (roleEntries.length > 0) {
      const mostCommonRoleId = roleEntries.reduce((a, b) =>
        roleCounts[a[0]] > roleCounts[b[0]] ? a : b
      )[0];

      const foundRole = users.find((u) => u.role_id === mostCommonRoleId)?.role
        ?.name;
      if (foundRole) {
        mostCommonRole = foundRole;
      }
    }

    // Get unique locales from current results for filter options
    const uniqueLocales = [
      ...new Set(transformedUsers.map((u) => u.locale).filter(Boolean)),
    ].sort();

    // Get unique group IDs from current results
    const uniqueGroupIds = [
      ...new Set(transformedUsers.map((u) => u.group_id).filter(Boolean)),
    ].sort((a, b) => (a || 0) - (b || 0));

    const response: UsersResponse = {
      users: transformedUsers,
      pagination,
      filters: {
        search: params.search || "",
        role: params.role || null,
        status: params.status || null,
        dateRange:
          params.dateFrom || params.dateTo
            ? {
                from: params.dateFrom ? new Date(params.dateFrom) : null,
                to: params.dateTo ? new Date(params.dateTo) : null,
              }
            : null,
        activityDateRange:
          params.activityDateFrom || params.activityDateTo
            ? {
                from: params.activityDateFrom
                  ? new Date(params.activityDateFrom)
                  : null,
                to: params.activityDateTo
                  ? new Date(params.activityDateTo)
                  : null,
              }
            : null,
        sortBy: (params.sortBy as unknown) || "created_at",
        sortOrder: params.sortOrder || "desc",
        hasAvatar: params.hasAvatar || null,
        locale: params.locale || null,
        group_id: params.group_id || null,
        activity_status: params.activity_status || null,
      },
      metadata: {
        totalActiveUsers: activeUsers,
        totalInactiveUsers: inactiveUsers,
        totalNeverLoggedIn: neverLoggedIn,
        averageLastLogin,
        mostCommonRole,
        // Enhanced metadata for UI components
        availableRoles: availableRoles.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          userCount: role._count.users,
        })),
        availableLocales: uniqueLocales,
        availableGroupIds: uniqueGroupIds,
        queryPerformance: {
          executionTime: Date.now() - startTime,
          totalQueries: 4,
          cacheHit: false, // This would be determined by caching layer
        },
      },
    };

    // Add caching headers for better performance
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    // Cache for 1 minute for GET requests with no search/filter params
    if (!params.search && !params.role && !params.status && params.page === 1) {
      headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
    } else {
      // Shorter cache for filtered results
      headers.set("Cache-Control", "public, max-age=30, s-maxage=30");
    }

    // Add ETag for conditional requests
    const etag = `"users-${total}-${Date.now()}"`;
    headers.set("ETag", etag);

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    // Determine error type and provide appropriate response
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createErrorResponse(
        "Database query failed",
        UserManagementErrorCodes.DATABASE_ERROR,
        500,
        `Prisma error: ${error.code} - ${error.message}`,
        ErrorSeverity.HIGH
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return createErrorResponse(
        "Invalid query parameters",
        UserManagementErrorCodes.VALIDATION_ERROR,
        400,
        error.message,
        ErrorSeverity.MEDIUM
      );
    }

    return createErrorResponse(
      "Failed to fetch users",
      UserManagementErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      ErrorSeverity.CRITICAL
    );
  }
}

// Enhanced validation helper for user creation
function validateUserCreationData(data: CreateUserRequest): {
  isValid: boolean;
  errors: { field: string; message: string; code: string }[];
  warnings: { field: string; message: string }[];
} {
  const errors: { field: string; message: string; code: string }[] = [];
  const warnings: { field: string; message: string }[] = [];

  // Required field validation
  if (!data.email?.trim()) {
    errors.push({
      field: "email",
      message: "Email is required",
      code: UserManagementErrorCodes.VALIDATION_ERROR,
    });
  }

  if (!data.first_name?.trim()) {
    errors.push({
      field: "first_name",
      message: "First name is required",
      code: UserManagementErrorCodes.VALIDATION_ERROR,
    });
  }

  if (!data.last_name?.trim()) {
    errors.push({
      field: "last_name",
      message: "Last name is required",
      code: UserManagementErrorCodes.VALIDATION_ERROR,
    });
  }

  if (!data.password) {
    errors.push({
      field: "password",
      message: "Password is required",
      code: UserManagementErrorCodes.VALIDATION_ERROR,
    });
  }

  // Email format validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({
      field: "email",
      message: "Invalid email format",
      code: UserManagementErrorCodes.INVALID_EMAIL_FORMAT,
    });
  }

  // Name length validation
  if (
    data.first_name &&
    data.first_name.trim().length > USER_VALIDATION_RULES.NAME_MAX_LENGTH
  ) {
    errors.push({
      field: "first_name",
      message: `First name must be less than ${USER_VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
      code: UserManagementErrorCodes.VALIDATION_ERROR,
    });
  }

  if (
    data.last_name &&
    data.last_name.trim().length > USER_VALIDATION_RULES.NAME_MAX_LENGTH
  ) {
    errors.push({
      field: "last_name",
      message: `Last name must be less than ${USER_VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
      code: UserManagementErrorCodes.VALIDATION_ERROR,
    });
  }

  // Password strength validation
  if (data.password) {
    if (data.password.length < USER_VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      errors.push({
        field: "password",
        message: `Password must be at least ${USER_VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`,
        code: UserManagementErrorCodes.WEAK_PASSWORD,
      });
    }

    if (data.password.length > USER_VALIDATION_RULES.PASSWORD_MAX_LENGTH) {
      errors.push({
        field: "password",
        message: `Password must be less than ${USER_VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters`,
        code: UserManagementErrorCodes.WEAK_PASSWORD,
      });
    }

    // Check for basic password strength
    const hasUpperCase = /[A-Z]/.test(data.password);
    const hasLowerCase = /[a-z]/.test(data.password);
    const hasNumbers = /\d/.test(data.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      warnings.push({
        field: "password",
        message:
          "Password should contain uppercase, lowercase, and numeric characters for better security",
      });
    }

    if (!hasSpecialChar) {
      warnings.push({
        field: "password",
        message:
          "Consider adding special characters for stronger password security",
      });
    }
  }

  // Optional field validation
  if (data.birthday) {
    const birthDate = new Date(data.birthday);
    if (isNaN(birthDate.getTime())) {
      errors.push({
        field: "birthday",
        message: "Invalid birthday format",
        code: UserManagementErrorCodes.INVALID_DATE_FORMAT,
      });
    } else if (birthDate > new Date()) {
      errors.push({
        field: "birthday",
        message: "Birthday cannot be in the future",
        code: UserManagementErrorCodes.VALIDATION_ERROR,
      });
    }
  }

  if (
    data.address &&
    data.address.length > USER_VALIDATION_RULES.ADDRESS_MAX_LENGTH
  ) {
    errors.push({
      field: "address",
      message: `Address must be less than ${USER_VALIDATION_RULES.ADDRESS_MAX_LENGTH} characters`,
      code: UserManagementErrorCodes.VALIDATION_ERROR,
    });
  }

  if (
    data.slack_webhook_url &&
    data.slack_webhook_url.length >
      USER_VALIDATION_RULES.SLACK_WEBHOOK_MAX_LENGTH
  ) {
    errors.push({
      field: "slack_webhook_url",
      message: `Slack webhook URL must be less than ${USER_VALIDATION_RULES.SLACK_WEBHOOK_MAX_LENGTH} characters`,
      code: UserManagementErrorCodes.VALIDATION_ERROR,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// POST /api/admin/users - Enhanced with comprehensive validation and error handling
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse(
        "Authentication required",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        401,
        "No valid session found",
        ErrorSeverity.HIGH
      );
    }

    const ability = createAbility(session);

    // Check if user has permission to create users
    if (ability.cannot("create", "User")) {
      return createErrorResponse(
        "Insufficient permissions to create users",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        403,
        "User lacks 'create' permission for 'User' resource",
        ErrorSeverity.HIGH
      );
    }

    // Parse and validate request data
    let requestData: CreateUserRequest;
    try {
      requestData = await request.json();
    } catch (error) {
      return createErrorResponse(
        "Invalid JSON in request body",
        UserManagementErrorCodes.VALIDATION_ERROR,
        400,
        "Request body must be valid JSON",
        ErrorSeverity.MEDIUM
      );
    }

    // Comprehensive validation
    const validation = validateUserCreationData(requestData);
    if (!validation.isValid) {
      return createErrorResponse(
        "Validation failed",
        UserManagementErrorCodes.VALIDATION_ERROR,
        400,
        {
          errors: validation.errors,
          warnings: validation.warnings,
        },
        ErrorSeverity.MEDIUM
      );
    }

    const {
      email,
      first_name,
      last_name,
      password,
      role_id,
      is_active,
      sex,
      birthday,
      address,
      avatar,
      locale,
      group_id,
      slack_webhook_url,
      coin,
    } = requestData;

    // Check for existing user and validate role in parallel
    const [existingUser, roleValidation] = await Promise.all([
      prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { id: true, email: true },
      }),
      role_id
        ? prisma.role.findUnique({
            where: { id: role_id },
            select: { id: true, name: true, permissions: true },
          })
        : Promise.resolve(null),
    ]);

    if (existingUser) {
      return createErrorResponse(
        "A user with this email already exists",
        UserManagementErrorCodes.EMAIL_ALREADY_EXISTS,
        400,
        {
          existingUserId: existingUser.id,
          conflictingEmail: existingUser.email,
        },
        ErrorSeverity.MEDIUM
      );
    }

    // Validate role if provided
    if (role_id && !roleValidation) {
      return createErrorResponse(
        "Invalid role selected",
        UserManagementErrorCodes.INVALID_ROLE,
        400,
        `Role with ID '${role_id}' does not exist`,
        ErrorSeverity.MEDIUM
      );
    }

    // Hash password with enhanced security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with comprehensive data handling
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        password: hashedPassword,
        role_id: role_id || null,
        is_active: is_active ?? true,
        sex: sex ?? true,
        birthday: birthday ? new Date(birthday) : null,
        address: address?.trim() || null,
        avatar: avatar?.trim() || null,
        locale: locale?.trim() || "en",
        group_id: group_id ?? 1,
        slack_webhook_url: slack_webhook_url?.trim() || null,
        coin: coin ? BigInt(coin) : BigInt(1000),
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        last_login: true,
        last_logout: true,
        avatar: true,
        sex: true,
        birthday: true,
        address: true,
        remember_token: true,
        deleted_at: true,
        coin: true,
        locale: true,
        group_id: true,
        role_id: true,
        slack_webhook_url: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
            description: true,
          },
        },
      },
    });

    const transformedUser = transformUser(newUser);

    // Create response with validation warnings if any
    const response: UserMutationResponse = {
      user: transformedUser,
      validation:
        validation.warnings.length > 0
          ? {
              isValid: true,
              errors: [],
              warnings: validation.warnings,
            }
          : undefined,
      metadata: {
        wasEmailChanged: false,
        wasRoleChanged: false,
        wasStatusChanged: false,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Unique constraint violation
        return createErrorResponse(
          "A user with this email already exists",
          UserManagementErrorCodes.EMAIL_ALREADY_EXISTS,
          400,
          `Unique constraint violation: ${error.meta?.target}`,
          ErrorSeverity.MEDIUM
        );
      }

      if (error.code === "P2003") {
        // Foreign key constraint violation
        return createErrorResponse(
          "Invalid role or reference data",
          UserManagementErrorCodes.INVALID_ROLE,
          400,
          `Foreign key constraint violation: ${error.meta?.field_name}`,
          ErrorSeverity.MEDIUM
        );
      }

      return createErrorResponse(
        "Database operation failed",
        UserManagementErrorCodes.DATABASE_ERROR,
        500,
        `Prisma error: ${error.code} - ${error.message}`,
        ErrorSeverity.HIGH
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return createErrorResponse(
        "Invalid data provided",
        UserManagementErrorCodes.VALIDATION_ERROR,
        400,
        error.message,
        ErrorSeverity.MEDIUM
      );
    }

    return createErrorResponse(
      "Failed to create user",
      UserManagementErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      ErrorSeverity.CRITICAL
    );
  }
}
