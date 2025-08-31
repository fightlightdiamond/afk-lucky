import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/admin/users/bulk/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { createAbility } from "@/lib/ability";

// Mock dependencies
vi.mock("@/lib/prisma", () => import("../../__mocks__/prisma"));
vi.mock("next-auth", () => import("../../__mocks__/auth"));
vi.mock("@/lib/ability", () => import("../../__mocks__/ability"));
vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Import mocks after mocking
import { mockAbility } from "../../__mocks__/ability";

const mockSession = {
  user: {
    id: "admin-id",
    email: "admin@test.com",
    firstName: "Admin",
    lastName: "User",
    role: {
      id: "role-1",
      name: "ADMIN",
      permissions: ["user:create", "user:read", "user:update", "user:delete"],
    },
    isActive: true,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

describe("/api/admin/users/bulk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
    (mockAbility.can as any).mockReturnValue(true);
    (mockAbility.cannot as any).mockReturnValue(false);
    (createAbility as any).mockReturnValue(mockAbility);
  });

  describe("POST", () => {
    it("should ban multiple users successfully", async () => {
      const userIds = ["user1", "user2", "user3"];
      (prisma.user.updateMany as any).mockResolvedValue({ count: 3 });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "ban",
            userIds,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(3);
      expect(data.failed).toBe(0);
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
        data: { is_active: false },
      });
    });

    it("should unban multiple users successfully", async () => {
      const userIds = ["user1", "user2"];
      (prisma.user.updateMany as any).mockResolvedValue({ count: 2 });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "unban",
            userIds,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(2);
      expect(data.failed).toBe(0);
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
        data: { is_active: true },
      });
    });

    it("should delete multiple users successfully", async () => {
      const userIds = ["user1", "user2"];
      (prisma.$transaction as any).mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            delete: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "delete",
            userIds,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(2);
      expect(data.failed).toBe(0);
    });

    it("should assign role to multiple users successfully", async () => {
      const userIds = ["user1", "user2"];
      const roleId = "role-id";
      (prisma.user.updateMany as any).mockResolvedValue({ count: 2 });
      (prisma.role.findUnique as any).mockResolvedValue({
        id: roleId,
        name: "USER",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "assign_role",
            userIds,
            roleId,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(2);
      expect(data.failed).toBe(0);
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
        data: { role_id: roleId },
      });
    });

    it("should prevent admin from deleting themselves", async () => {
      const userIds = ["admin-id", "user2"];

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "delete",
            userIds,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("cannot delete your own account");
    });

    it("should prevent admin from banning themselves", async () => {
      const userIds = ["admin-id", "user2"];

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "ban",
            userIds,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("cannot ban your own account");
    });

    it("should handle invalid operation", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "invalid_operation",
            userIds: ["user1"],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid operation");
    });

    it("should handle missing userIds", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "ban",
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid bulk operation request");
    });

    it("should handle empty userIds array", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "ban",
            userIds: [],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid bulk operation request");
    });

    it("should handle role assignment without roleId", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "assign_role",
            userIds: ["user1"],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Role ID is required");
    });

    it("should handle invalid role for assignment", async () => {
      const userIds = ["user1"];
      const roleId = "invalid-role-id";
      (prisma.role.findUnique as any).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "assign_role",
            userIds,
            roleId,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid role");
    });

    it("should handle database errors gracefully", async () => {
      const userIds = ["user1", "user2"];
      (prisma.user.updateMany as any).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "ban",
            userIds,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Failed to execute bulk ban");
    });

    it("should handle unauthorized access", async () => {
      (getServerSession as any).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify({
            operation: "ban",
            userIds: ["user1"],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });
});
