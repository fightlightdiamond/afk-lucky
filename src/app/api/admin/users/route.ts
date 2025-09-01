import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAbility } from "@/lib/ability";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { 
  validateCreateUser, 
  type CreateUserInput,
  type GetUsersParamsInput,
  validateGetUsersParams,
} from "@/lib/validation";
import {
  UserWithRoleSelect,
  userSelectFields,
  transformUserForAPI,
  createOrderBy,
} from "@/lib/prisma-types";
import {
  UserManagementErrorCodes,
  ErrorSeverity,
  USER_VALIDATION_RULES,
  PAGINATION_LIMITS,
} from "@/types/user";

// Enhanced error response helper
function createErrorResponse(
  error: string,
  code: UserManagementErrorCodes,
  status: number,
  details?: unknown,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): NextResponse {
  const errorResponse = {
    error,
    code,
    details,
    severity,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(errorResponse, { status });
}

// GET /api/admin/users - Enhanced with Zod validation
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse(
        "Authentication required",
        UserManagementErrorCodes.UNAUTHORIZED,
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

    // Parse and validate query parameters using Zod
    const { searchParams } = new URL(request.url);
    const rawParams = {
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      search: searchParams.get("search"),
      role: searchParams.get("role"),
      status: searchParams.get("status"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      activityDateFrom: searchParams.get("activityDateFrom"),
      activityDateTo: searchParams.get("activityDateTo"),
      hasAvatar: searchParams.get("hasAvatar"),
      locale: searchParams.get("locale"),
      group_id: searchParams.get("group_id"),
      activity_status: searchParams.get("activity_status"),
    };

    const validationResult = validateGetUsersParams(rawParams);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid query parameters",
        UserManagementErrorCodes.VALIDATION_ERROR,
        400,
        validationResult.error?.errors,
        ErrorSeverity.MEDIUM
      );
    }

    const params = validationResult.data!;

    // Build where clause for filtering
    const where: Prisma.UserWhereInput = {};

    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: "insensitive" } },
        { first_name: { contains: params.search, mode: "insensitive" } },
        { last_name: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.role) {
      where.role = { name: params.role as any };
    }

    if (params.status && params.status !== "all") {
      where.is_active = params.status === "active";
    }

    if (params.dateFrom || params.dateTo) {
      where.created_at = {};
      if (params.dateFrom) {
        where.created_at.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.created_at.lte = new Date(params.dateTo);
      }
    }

    if (params.activityDateFrom || params.activityDateTo) {
      where.last_login = {};
      if (params.activityDateFrom) {
        where.last_login.gte = new Date(params.activityDateFrom);
      }
      if (params.activityDateTo) {
        where.last_login.lte = new Date(params.activityDateTo);
      }
    }

    if (params.hasAvatar !== undefined) {
      if (params.hasAvatar) {
        where.avatar = { not: null };
      } else {
        where.avatar = null;
      }
    }

    if (params.locale) {
      where.locale = params.locale;
    }

    if (params.group_id) {
      where.group_id = params.group_id;
    }

    // Execute queries in parallel for better performance
    const [users, totalUsers, roleStats, availableRoles] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelectFields,
        orderBy: createOrderBy(params.sortBy, params.sortOrder),
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.user.count({ where }),
      prisma.user.groupBy({
        by: ["role_id", "is_active"],
        where,
        _count: {
          id: true,
        },
      }),
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

    // Transform users data
    const transformedUsers = users.map(transformUserForAPI);

    // Build response
    const response = {
      users: transformedUsers,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / params.pageSize),
      },
      metadata: {
        totalActiveUsers: roleStats.filter((s) => s.is_active).reduce((sum, s) => sum + s._count.id, 0),
        totalInactiveUsers: roleStats.filter((s) => !s.is_active).reduce((sum, s) => sum + s._count.id, 0),
        availableRoles: availableRoles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          userCount: role._count.users,
        })),
        requestDuration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);

  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error:", error.code, error.message);
      
      if (error.code === "P2002") {
        return createErrorResponse(
          "Duplicate entry found",
          UserManagementErrorCodes.VALIDATION_ERROR,
          409,
          `Unique constraint violation: ${(error as any).meta?.target}`,
          ErrorSeverity.MEDIUM
        );
      }

      if (error.code === "P2003") {
        return createErrorResponse(
          "Invalid role or reference data",
          UserManagementErrorCodes.INVALID_ROLE,
          400,
          `Foreign key constraint violation: ${(error as any).meta?.field_name}`,
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
      "Failed to retrieve users",
      UserManagementErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      ErrorSeverity.CRITICAL
    );
  }
}

// POST /api/admin/users - Create new user with Zod validation
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse(
        "Authentication required",
        UserManagementErrorCodes.UNAUTHORIZED,
        401,
        "No valid session found",
        ErrorSeverity.HIGH
      );
    }

    const ability = createAbility(session);

    if (ability.cannot("create", "User")) {
      return createErrorResponse(
        "Insufficient permissions to create users",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        403,
        "User lacks 'create' permission for 'User' resource",
        ErrorSeverity.HIGH
      );
    }

    // Parse and validate request body using Zod
    const body = await request.json();
    const validationResult = validateCreateUser(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid user data",
        UserManagementErrorCodes.VALIDATION_ERROR,
        400,
        validationResult.error?.errors,
        ErrorSeverity.MEDIUM
      );
    }

    const userData = validationResult.data!;

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 12);
    }

    // Create user with proper Prisma types
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: hashedPassword || "",
        is_active: userData.is_active ?? true,
        role_id: userData.role_id,
        avatar: userData.avatar,
        sex: userData.sex,
        birthday: userData.birthday ? new Date(userData.birthday) : null,
        address: userData.address,
        locale: userData.locale,
        group_id: userData.group_id,
        slack_webhook_url: userData.slack_webhook_url,
      },
      select: userSelectFields,
    });

    const user = transformUserForAPI(newUser as UserWithRoleSelect);

    const response = {
      success: true,
      user,
      message: "User created successfully",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error: unknown) {
    console.error("Error creating user:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const field = (error as any).meta?.target as string[];
      return createErrorResponse(
        `User with this ${field?.[0] || "field"} already exists`,
        UserManagementErrorCodes.VALIDATION_ERROR,
        409,
        `Duplicate ${field?.[0] || "field"} constraint violation`,
        ErrorSeverity.MEDIUM
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
