import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAbility } from "@/lib/ability";
import {
  BulkOperationRequest,
  BulkOperationResult,
  UserManagementErrorCodes,
} from "@/types/user";

// POST /api/admin/users/bulk - Bulk operations endpoint
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized",
          code: UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
          timestamp: new Date().toISOString(),
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const ability = createAbility(session);

    const { operation, userIds, roleId }: BulkOperationRequest =
      await request.json();

    // Validate input
    if (
      !operation ||
      !userIds ||
      !Array.isArray(userIds) ||
      userIds.length === 0
    ) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid bulk operation request",
          code: UserManagementErrorCodes.VALIDATION_ERROR,
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check permissions based on operation
    const permissionMap = {
      ban: "update",
      unban: "update",
      delete: "delete",
      assign_role: "update",
    };

    const requiredPermission = permissionMap[operation];
    if (ability.cannot(requiredPermission, "User")) {
      return new NextResponse(
        JSON.stringify({
          error: "Insufficient permissions for this operation",
          code: UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
          timestamp: new Date().toISOString(),
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prevent operations on current user for certain operations
    if (
      (operation === "ban" || operation === "delete") &&
      userIds.includes(session.user.id)
    ) {
      return new NextResponse(
        JSON.stringify({
          error: `You cannot ${operation} your own account`,
          code:
            operation === "ban"
              ? UserManagementErrorCodes.CANNOT_BAN_SELF
              : UserManagementErrorCodes.CANNOT_DELETE_SELF,
          timestamp: new Date().toISOString(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate role for assign_role operation
    if (operation === "assign_role") {
      if (!roleId) {
        return new NextResponse(
          JSON.stringify({
            error: "Role ID is required for role assignment",
            code: UserManagementErrorCodes.VALIDATION_ERROR,
            timestamp: new Date().toISOString(),
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return new NextResponse(
          JSON.stringify({
            error: "Invalid role selected",
            code: UserManagementErrorCodes.INVALID_ROLE,
            timestamp: new Date().toISOString(),
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Execute bulk operation
    try {
      switch (operation) {
        case "ban":
          const filteredUserIds = userIds.filter(
            (id) => id !== session.user.id
          );
          const banResult = await prisma.user.updateMany({
            where: {
              id: { in: filteredUserIds },
            },
            data: { is_active: false },
          });
          result.success = banResult.count;
          result.failed = userIds.length - banResult.count;
          break;

        case "unban":
          const unbanResult = await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { is_active: true },
          });
          result.success = unbanResult.count;
          result.failed = userIds.length - unbanResult.count;
          break;

        case "assign_role":
          const roleResult = await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { role_id: roleId },
          });
          result.success = roleResult.count;
          result.failed = userIds.length - roleResult.count;
          break;

        case "delete":
          // Use transaction for delete operations to handle potential foreign key constraints
          await prisma.$transaction(async (tx) => {
            for (const userId of userIds) {
              if (userId === session.user.id) {
                result.failed++;
                result.errors.push(`Cannot delete your own account`);
                continue;
              }

              try {
                await tx.user.delete({
                  where: { id: userId },
                });
                result.success++;
              } catch (error) {
                result.failed++;
                result.errors.push(
                  `Failed to delete user ${userId}: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`
                );
              }
            }
          });
          break;

        default:
          return new NextResponse(
            JSON.stringify({
              error: "Invalid operation",
              code: UserManagementErrorCodes.VALIDATION_ERROR,
              timestamp: new Date().toISOString(),
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
      }

      // If some operations failed, return partial success
      if (result.failed > 0) {
        return NextResponse.json(
          {
            ...result,
            message: `Bulk ${operation} completed with ${result.success} successes and ${result.failed} failures`,
          },
          { status: 207 }
        ); // 207 Multi-Status
      }

      return NextResponse.json({
        ...result,
        message: `Bulk ${operation} completed successfully`,
      });
    } catch (error) {
      console.error(`Error in bulk ${operation}:`, error);
      return new NextResponse(
        JSON.stringify({
          error: `Failed to execute bulk ${operation}`,
          code: UserManagementErrorCodes.BULK_OPERATION_FAILED,
          details: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        code: "BULK_OPERATION_ERROR",
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
