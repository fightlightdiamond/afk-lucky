import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "@/app/api/admin/stats/route";
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

describe("/api/admin/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-id", email: "admin@test.com", role: "ADMIN" },
    });
  });

  describe("GET", () => {
    it("should return admin statistics", async () => {
      // Mock user counts
      mockPrisma.user.count
        .mockResolvedValueOnce(100) // total users
        .mockResolvedValueOnce(85) // active users
        .mockResolvedValueOnce(15) // inactive users
        .mockResolvedValueOnce(25); // users created this month

      // Mock role distribution
      mockPrisma.user.groupBy.mockResolvedValue([
        { role_id: "role-1", _count: { role_id: 80 } },
        { role_id: "role-2", _count: { role_id: 20 } },
      ]);

      // Mock roles
      mockPrisma.role.findMany.mockResolvedValue([
        { id: "role-1", name: "USER" },
        { id: "role-2", name: "ADMIN" },
      ]);

      // Mock recent activity
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "user-1",
          email: "user1@test.com",
          first_name: "John",
          last_name: "Doe",
          created_at: new Date(),
        },
        {
          id: "user-2",
          email: "user2@test.com",
          first_name: "Jane",
          last_name: "Smith",
          created_at: new Date(),
        },
      ]);

      const request = new NextRequest("http://localhost:3000/api/admin/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        users: {
          total: 100,
          active: 85,
          inactive: 15,
          newThisMonth: 25,
        },
        roleDistribution: [
          { role: "USER", count: 80 },
          { role: "ADMIN", count: 20 },
        ],
        recentActivity: [
          {
            id: "user-1",
            email: "user1@test.com",
            first_name: "John",
            last_name: "Doe",
            created_at: expect.any(String),
          },
          {
            id: "user-2",
            email: "user2@test.com",
            first_name: "Jane",
            last_name: "Smith",
            created_at: expect.any(String),
          },
        ],
      });
    });

    it("should handle empty role distribution", async () => {
      mockPrisma.user.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      mockPrisma.user.groupBy.mockResolvedValue([]);
      mockPrisma.role.findMany.mockResolvedValue([]);
      mockPrisma.user.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/admin/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users.total).toBe(0);
      expect(data.roleDistribution).toEqual([]);
      expect(data.recentActivity).toEqual([]);
    });

    it("should handle users without roles", async () => {
      mockPrisma.user.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(40)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);

      mockPrisma.user.groupBy.mockResolvedValue([
        { role_id: "role-1", _count: { role_id: 30 } },
        { role_id: null, _count: { role_id: 20 } },
      ]);

      mockPrisma.role.findMany.mockResolvedValue([
        { id: "role-1", name: "USER" },
      ]);

      mockPrisma.user.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/admin/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.roleDistribution).toEqual([
        { role: "USER", count: 30 },
        { role: "No Role", count: 20 },
      ]);
    });

    it("should handle database errors gracefully", async () => {
      mockPrisma.user.count.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/admin/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should handle unauthorized access", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/admin/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should calculate this month's users correctly", async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      mockPrisma.user.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(85)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(25);

      mockPrisma.user.groupBy.mockResolvedValue([]);
      mockPrisma.role.findMany.mockResolvedValue([]);
      mockPrisma.user.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/admin/stats");
      await GET(request);

      // Verify that the count query for new users this month uses correct date filter
      expect(mockPrisma.user.count).toHaveBeenCalledWith({
        where: {
          created_at: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it("should limit recent activity to 10 users", async () => {
      mockPrisma.user.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(85)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(25);

      mockPrisma.user.groupBy.mockResolvedValue([]);
      mockPrisma.role.findMany.mockResolvedValue([]);
      mockPrisma.user.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/admin/stats");
      await GET(request);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          created_at: true,
        },
        orderBy: {
          created_at: "desc",
        },
        take: 10,
      });
    });

    it("should handle partial database failures", async () => {
      // First count succeeds, others fail
      mockPrisma.user.count
        .mockResolvedValueOnce(100)
        .mockRejectedValueOnce(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/admin/stats");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});
