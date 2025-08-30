import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/admin/users/bulk/route";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// Mock dependencies
vi.mock("@/lib/prisma");
vi.mock("next-auth");
vi.mock("@/lib/ability", () => ({
  createAbilityForUser: vi.fn(() => ({
    can: vi.fn(() => true),
  })),
}));

const mockPrisma = prisma as any;
const mockGetServerSession = getServerSession as any;

describe("/api/admin/users/bulk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-id", email: "admin@test.com", role: "ADMIN" },
    });
  });

  describe("POST", () => {
    it("should ban multiple users successfully", async () => {
      const userIds = ["user1", "user2", "user3"];
      mockPrisma.user.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "user1", email: "user1@test.com" },
        { id: "user2", email: "user2@test.com" },
        { id: "user3", email: "user3@test.com" },
      ]);

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
      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
        data: { is_active: false },
      });
    });

    it("should unban multiple users successfully", async () => {
      const userIds = ["user1", "user2"];
      mockPrisma.user.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "user1", email: "user1@test.com" },
        { id: "user2", email: "user2@test.com" },
      ]);

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
      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
        data: { is_active: true },
      });
    });

    it("should delete multiple users successfully", async () => {
      const userIds = ["user1", "user2"];
      mockPrisma.user.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "user1", email: "user1@test.com" },
        { id: "user2", email: "user2@test.com" },
      ]);

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
      expect(mockPrisma.user.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
      });
    });

    it("should assign role to multiple users successfully", async () => {
      const userIds = ["user1", "user2"];
      const roleId = "role-id";
      mockPrisma.user.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "user1", email: "user1@test.com" },
        { id: "user2", email: "user2@test.com" },
      ]);
      mockPrisma.role.findUnique.mockResolvedValue({
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
      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: userIds } },
        data: { role_id: roleId },
      });
    });

    it("should prevent admin from deleting themselves", async () => {
      const userIds = ["admin-id", "user2"];
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "admin-id", email: "admin@test.com" },
        { id: "user2", email: "user2@test.com" },
      ]);

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
      expect(data.error).toContain("Cannot delete your own account");
    });

    it("should prevent admin from banning themselves", async () => {
      const userIds = ["admin-id", "user2"];
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "admin-id", email: "admin@test.com" },
        { id: "user2", email: "user2@test.com" },
      ]);

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
      expect(data.error).toContain("Cannot ban your own account");
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
      expect(data.error).toContain("User IDs are required");
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
      expect(data.error).toContain("User IDs are required");
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
      mockPrisma.role.findUnique.mockResolvedValue(null);

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
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "user1", email: "user1@test.com" },
        { id: "user2", email: "user2@test.com" },
      ]);
      mockPrisma.user.updateMany.mockRejectedValue(new Error("Database error"));

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
      expect(data.error).toContain("Internal server error");
    });

    it("should handle unauthorized access", async () => {
      mockGetServerSession.mockResolvedValue(null);

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
