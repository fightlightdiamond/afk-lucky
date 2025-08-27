import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAbility } from "@/lib/ability";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import {
  UpdateUserRequest,
  UserMutationResponse,
  UserManagementErrorCodes,
  User,
  ErrorSeverity,
  EnhancedApiErrorResponse,
  USER_VALIDATION_RULES,
} from "@/types/user";

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

// Enhanced validation helper for user updates
function validateUserUpdateData(
  data: UpdateUserRequest,
  isCurrentUser: boolean
): {
  isValid: boolean;
  errors: { field: string; message: string; code: string }[];
  warnings: { field: string; message: string }[];
} {
  const errors: { field: string; message: string; code: string }[] = [];
  const warnings: { field: string; message: string }[] = [];

  // Email validation if provided
  if (data.email !== undefined) {
    if (!data.email?.trim()) {
      errors.push({
        field: "email",
        message: "Email cannot be empty",
        code: UserManagementErrorCodes.VALIDATION_ERROR,
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({
        field: "email",
        message: "Invalid email format",
        code: UserManagementErrorCodes.INVALID_EMAIL_FORMAT,
      });
    } else if (data.email.length > USER_VALIDATION_RULES.EMAIL_MAX_LENGTH) {
      errors.push({
        field: "email",
        message: `Email must be less than ${USER_VALIDATION_RULES.EMAIL_MAX_LENGTH} characters`,
        code: UserManagementErrorCodes.VALIDATION_ERROR,
      });
    }
  }

  // Name validation if provided
  if (data.first_name !== undefined) {
    if (!data.first_name?.trim()) {
      errors.push({
        field: "first_name",
        message: "First name cannot be empty",
        code: UserManagementErrorCodes.VALIDATION_ERROR,
      });
    } else if (
      data.first_name.trim().length > USER_VALIDATION_RULES.NAME_MAX_LENGTH
    ) {
      errors.push({
        field: "first_name",
        message: `First name must be less than ${USER_VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
        code: UserManagementErrorCodes.VALIDATION_ERROR,
      });
    }
  }

  if (data.last_name !== undefined) {
    if (!data.last_name?.trim()) {
      errors.push({
        field: "last_name",
        message: "Last name cannot be empty",
        code: UserManagementErrorCodes.VALIDATION_ERROR,
      });
    } else if (
      data.last_name.trim().length > USER_VALIDATION_RULES.NAME_MAX_LENGTH
    ) {
      errors.push({
        field: "last_name",
        message: `Last name must be less than ${USER_VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
        code: UserManagementErrorCodes.VALIDATION_ERROR,
      });
    }
  }

  // Password validation if provided
  if (data.password !== undefined && data.password) {
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

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      warnings.push({
        field: "password",
        message:
          "Password should contain uppercase, lowercase, and numeric characters for better security",
      });
    }
  }

  // Status validation - prevent self-deactivation
  if (data.is_active === false && isCurrentUser) {
    errors.push({
      field: "is_active",
      message: "You cannot deactivate your own account",
      code: UserManagementErrorCodes.CANNOT_MODIFY_SELF,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Helper function to transform user data
function transformUser(user: any): User {
  const age = user.birthday
    ? Math.floor(
        (Date.now() - new Date(user.birthday).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : undefined;

  let activity_status: "online" | "offline" | "never" = "never";
  if (user.last_login) {
    const lastLoginTime = new Date(user.last_login).getTime();
    const now = Date.now();
    const timeDiff = now - lastLoginTime;

    if (timeDiff < 5 * 60 * 1000) {
      activity_status = "online";
    } else {
      activity_status = "offline";
    }
  }

  // Determine user status based on is_active and other factors
  let status: "active" | "inactive" | "banned" | "suspended" | "pending" =
    "inactive";
  if (user.is_active) {
    status = "active";
  } else {
    // In a real implementation, you might have additional fields to determine
    // if a user is banned vs just inactive. For now, we'll use is_active.
    status = "inactive";
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
    coin: user.coin?.toString(),
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
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    display_name: `${user.first_name} ${user.last_name}`.trim(),
    status,
    activity_status,
    age,
  };
}

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    if (ability.cannot("read", "User")) {
      return createErrorResponse(
        "Insufficient permissions to read users",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        403,
        "User lacks 'read' permission for 'User' resource",
        ErrorSeverity.HIGH
      );
    }

    const userId = params.id;

    if (!userId) {
      return createErrorResponse(
        "User ID is required",
        UserManagementErrorCodes.INVALID_USER_ID,
        400,
        "User ID parameter is missing",
        ErrorSeverity.MEDIUM
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
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

    if (!user) {
      return createErrorResponse(
        "User not found",
        UserManagementErrorCodes.USER_NOT_FOUND,
        404,
        `User with ID '${userId}' does not exist`,
        ErrorSeverity.MEDIUM
      );
    }

    const transformedUser = transformUser(user);

    return NextResponse.json({
      user: transformedUser,
      metadata: {
        permissions: user.role?.permissions || [],
        canEdit: ability.can("update", "User"),
        canDelete: ability.can("delete", "User") && user.id !== session.user.id,
        canToggleStatus:
          ability.can("update", "User") && user.id !== session.user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createErrorResponse(
        "Database query failed",
        UserManagementErrorCodes.DATABASE_ERROR,
        500,
        `Prisma error: ${error.code} - ${error.message}`,
        ErrorSeverity.HIGH
      );
    }

    return createErrorResponse(
      "Failed to fetch user",
      UserManagementErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      ErrorSeverity.CRITICAL
    );
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    if (ability.cannot("update", "User")) {
      return createErrorResponse(
        "Insufficient permissions to update users",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        403,
        "User lacks 'update' permission for 'User' resource",
        ErrorSeverity.HIGH
      );
    }

    const userId = params.id;

    if (!userId) {
      return createErrorResponse(
        "User ID is required",
        UserManagementErrorCodes.INVALID_USER_ID,
        400,
        "User ID parameter is missing",
        ErrorSeverity.MEDIUM
      );
    }

    // Parse request data
    let requestData: UpdateUserRequest;
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role_id: true },
    });

    if (!existingUser) {
      return createErrorResponse(
        "User not found",
        UserManagementErrorCodes.USER_NOT_FOUND,
        404,
        `User with ID '${userId}' does not exist`,
        ErrorSeverity.MEDIUM
      );
    }

    const isCurrentUser = existingUser.id === session.user.id;

    // Validate request data
    const validation = validateUserUpdateData(requestData, isCurrentUser);
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

    // Check for email conflicts if email is being changed
    if (requestData.email && requestData.email !== existingUser.email) {
      const emailConflict = await prisma.user.findFirst({
        where: {
          email: {
            equals: requestData.email.toLowerCase().trim(),
            mode: "insensitive",
          },
          id: { not: userId },
        },
        select: { id: true, email: true },
      });

      if (emailConflict) {
        return createErrorResponse(
          "Email address is already in use",
          UserManagementErrorCodes.EMAIL_ALREADY_EXISTS,
          400,
          {
            conflictingUserId: emailConflict.id,
            conflictingEmail: emailConflict.email,
          },
          ErrorSeverity.MEDIUM
        );
      }
    }

    // Validate role if provided
    if (requestData.role_id && requestData.role_id !== existingUser.role_id) {
      const roleExists = await prisma.role.findUnique({
        where: { id: requestData.role_id },
        select: { id: true, name: true, permissions: true },
      });

      if (!roleExists) {
        return createErrorResponse(
          "Invalid role selected",
          UserManagementErrorCodes.INVALID_ROLE,
          400,
          `Role with ID '${requestData.role_id}' does not exist`,
          ErrorSeverity.MEDIUM
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    const previousValues: any = {};

    if (requestData.email !== undefined) {
      updateData.email = requestData.email.toLowerCase().trim();
      previousValues.email = existingUser.email;
    }

    if (requestData.first_name !== undefined) {
      updateData.first_name = requestData.first_name.trim();
    }

    if (requestData.last_name !== undefined) {
      updateData.last_name = requestData.last_name.trim();
    }

    if (requestData.password) {
      updateData.password = await bcrypt.hash(requestData.password, 12);
    }

    if (requestData.role_id !== undefined) {
      updateData.role_id = requestData.role_id || null;
      previousValues.role_id = existingUser.role_id;
    }

    if (requestData.is_active !== undefined) {
      updateData.is_active = requestData.is_active;
    }

    if (requestData.locale !== undefined) {
      updateData.locale = requestData.locale;
    }

    if (requestData.sex !== undefined) {
      updateData.sex = requestData.sex;
    }

    if (requestData.birthday !== undefined) {
      updateData.birthday = requestData.birthday
        ? new Date(requestData.birthday)
        : null;
    }

    if (requestData.address !== undefined) {
      updateData.address = requestData.address;
    }

    if (requestData.avatar !== undefined) {
      updateData.avatar = requestData.avatar;
    }

    if (requestData.group_id !== undefined) {
      updateData.group_id = requestData.group_id;
    }

    if (requestData.slack_webhook_url !== undefined) {
      updateData.slack_webhook_url = requestData.slack_webhook_url;
    }

    if (requestData.coin !== undefined) {
      updateData.coin = requestData.coin ? BigInt(requestData.coin) : null;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
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

    const transformedUser = transformUser(updatedUser);

    const response: UserMutationResponse = {
      user: transformedUser,
      validation: {
        isValid: true,
        errors: [],
        warnings: validation.warnings,
      },
      metadata: {
        wasEmailChanged:
          !!requestData.email && requestData.email !== existingUser.email,
        wasRoleChanged:
          !!requestData.role_id && requestData.role_id !== existingUser.role_id,
        wasStatusChanged: requestData.is_active !== undefined,
        previousValues,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createErrorResponse(
        "Database update failed",
        UserManagementErrorCodes.DATABASE_ERROR,
        500,
        `Prisma error: ${error.code} - ${error.message}`,
        ErrorSeverity.HIGH
      );
    }

    return createErrorResponse(
      "Failed to update user",
      UserManagementErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      ErrorSeverity.CRITICAL
    );
  }
}

// PATCH /api/admin/users/[id] - Partial update (for status toggles, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    if (ability.cannot("update", "User")) {
      return createErrorResponse(
        "Insufficient permissions to update users",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        403,
        "User lacks 'update' permission for 'User' resource",
        ErrorSeverity.HIGH
      );
    }

    const userId = params.id;

    if (!userId) {
      return createErrorResponse(
        "User ID is required",
        UserManagementErrorCodes.INVALID_USER_ID,
        400,
        "User ID parameter is missing",
        ErrorSeverity.MEDIUM
      );
    }

    // Parse request data
    let requestData: Partial<
      UpdateUserRequest & { reason?: string; action?: string }
    >;
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

    // Check if user exists and get current state for audit logging
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        is_active: true,
        first_name: true,
        last_name: true,
        email: true,
        updated_at: true,
      },
    });

    if (!existingUser) {
      return createErrorResponse(
        "User not found",
        UserManagementErrorCodes.USER_NOT_FOUND,
        404,
        `User with ID '${userId}' does not exist`,
        ErrorSeverity.MEDIUM
      );
    }

    // Prevent self-modification for certain operations
    const isCurrentUser = existingUser.id === session.user.id;
    if (isCurrentUser && requestData.is_active === false) {
      return createErrorResponse(
        "You cannot deactivate your own account",
        UserManagementErrorCodes.CANNOT_MODIFY_SELF,
        400,
        "Self-deactivation is not allowed",
        ErrorSeverity.MEDIUM
      );
    }

    // Additional validation for ban/unban operations
    if (isCurrentUser && requestData.action === "ban") {
      return createErrorResponse(
        "You cannot ban your own account",
        UserManagementErrorCodes.CANNOT_BAN_SELF,
        400,
        "Self-banning is not allowed",
        ErrorSeverity.MEDIUM
      );
    }

    // Store previous values for audit logging
    const previousValues = {
      is_active: existingUser.is_active,
      updated_at: existingUser.updated_at,
    };

    // Extract audit information
    const { reason, action, ...updateData } = requestData;

    // Update user with only provided fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
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

    // Create audit log entry for status changes
    if (
      requestData.is_active !== undefined &&
      requestData.is_active !== previousValues.is_active
    ) {
      const auditAction =
        action || (requestData.is_active ? "activate" : "deactivate");
      const auditReason =
        reason || `User status changed via ${auditAction} action`;

      // Log the status change (in a real app, this would go to an audit log table)
      console.log("AUDIT LOG - User Status Change:", {
        timestamp: new Date().toISOString(),
        adminUserId: session.user.id,
        adminUserEmail: session.user.email,
        targetUserId: userId,
        targetUserEmail: existingUser.email,
        targetUserName: `${existingUser.first_name} ${existingUser.last_name}`,
        action: auditAction,
        reason: auditReason,
        previousStatus: previousValues.is_active ? "active" : "inactive",
        newStatus: requestData.is_active ? "active" : "inactive",
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      });

      // In a production app, you would insert into an audit_logs table:
      /*
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          targetUserId: userId,
          action: auditAction,
          resource: "User",
          resourceId: userId,
          oldValues: previousValues,
          newValues: { is_active: requestData.is_active },
          reason: auditReason,
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          userAgent: request.headers.get("user-agent"),
        },
      });
      */
    }

    const transformedUser = transformUser(updatedUser);

    return NextResponse.json({
      user: transformedUser,
      auditInfo: {
        action: action || "update",
        reason: reason || "User updated",
        timestamp: new Date().toISOString(),
        performedBy: session.user.email,
      },
    });
  } catch (error) {
    console.error("Error patching user:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createErrorResponse(
        "Database update failed",
        UserManagementErrorCodes.DATABASE_ERROR,
        500,
        `Prisma error: ${error.code} - ${error.message}`,
        ErrorSeverity.HIGH
      );
    }

    return createErrorResponse(
      "Failed to update user",
      UserManagementErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      ErrorSeverity.CRITICAL
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    if (ability.cannot("delete", "User")) {
      return createErrorResponse(
        "Insufficient permissions to delete users",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        403,
        "User lacks 'delete' permission for 'User' resource",
        ErrorSeverity.HIGH
      );
    }

    const userId = params.id;

    if (!userId) {
      return createErrorResponse(
        "User ID is required",
        UserManagementErrorCodes.INVALID_USER_ID,
        400,
        "User ID parameter is missing",
        ErrorSeverity.MEDIUM
      );
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return createErrorResponse(
        "You cannot delete your own account",
        UserManagementErrorCodes.CANNOT_DELETE_SELF,
        400,
        "Self-deletion is not allowed",
        ErrorSeverity.MEDIUM
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, first_name: true, last_name: true },
    });

    if (!existingUser) {
      return createErrorResponse(
        "User not found",
        UserManagementErrorCodes.USER_NOT_FOUND,
        404,
        `User with ID '${userId}' does not exist`,
        ErrorSeverity.MEDIUM
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: `User "${existingUser.first_name} ${existingUser.last_name}" deleted successfully`,
      deletedUserId: userId,
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createErrorResponse(
        "Database deletion failed",
        UserManagementErrorCodes.DATABASE_ERROR,
        500,
        `Prisma error: ${error.code} - ${error.message}`,
        ErrorSeverity.HIGH
      );
    }

    return createErrorResponse(
      "Failed to delete user",
      UserManagementErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      ErrorSeverity.CRITICAL
    );
  }
}
