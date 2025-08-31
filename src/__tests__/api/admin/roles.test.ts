import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, POST } from "@/app/api/admin/roles/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

// Mock dependencies
vi.mock("@/lib/prisma", () => import("../../__mocks__/prisma"));
vi.mock("next-auth", () => import("../../__mocks__/auth"));
vi.mock("@/lib/ability", () => import("../../__mocks__/ability"));

// Import mocks after mocking
import { mockPrisma } from "../../__mocks__/prisma";
import { getServerSession as mockGetServerSession } from "../../__mocks__/auth";

describe("/api/admin/roles", () => {
  const mockRoles = [
    {
      id: "role-1",
      name: "ADMIN",
      permissions: ["read:users", "write:users", "delete:users"],
      description: "Administrator role",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "role-2",
      name: "USER",
      permissions: ["read:profile"],
      description: "Regular user role",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-id", email: "admin@test.com", role: "ADMIN" },
    });
  });

  describe("GET", () => {
    it("should return all roles", async () => {
      mockPrisma.role.findMany.mockResolvedValue(mockRoles);

      const request = new NextRequest("http://localhost:3000/api/admin/roles");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockRoles);
      expect(mockPrisma.role.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      });
    });

    it("should handle database errors", async () => {
      mockPrisma.role.findMany.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/admin/roles");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should handle unauthorized access", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/admin/roles");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("POST", () => {
    it("should create a new role", async () => {
      const newRole = {
        name: "MODERATOR",
        permissions: ["read:users", "write:users"],
        description: "Moderator role",
      };

      const createdRole = {
        id: "role-3",
        ...newRole,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrisma.role.create.mockResolvedValue(createdRole);

      const request = new NextRequest("http://localhost:3000/api/admin/roles", {
        method: "POST",
        body: JSON.stringify(newRole),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("MODERATOR");
      expect(data.permissions).toEqual(["read:users", "write:users"]);
      expect(mockPrisma.role.create).toHaveBeenCalledWith({
        data: newRole,
      });
    });

    it("should handle duplicate role names", async () => {
      const duplicateRole = {
        name: "ADMIN",
        permissions: ["read:users"],
        description: "Duplicate admin role",
      };

      mockPrisma.role.create.mockRejectedValue({
        code: "P2002",
        meta: { target: ["name"] },
      });

      const request = new NextRequest("http://localhost:3000/api/admin/roles", {
        method: "POST",
        body: JSON.stringify(duplicateRole),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Role name already exists");
    });

    it("should validate required fields", async () => {
      const invalidRole = {
        permissions: ["read:users"],
        description: "Role without name",
      };

      const request = new NextRequest("http://localhost:3000/api/admin/roles", {
        method: "POST",
        body: JSON.stringify(invalidRole),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Name is required");
    });

    it("should validate permissions array", async () => {
      const invalidRole = {
        name: "TEST_ROLE",
        permissions: "invalid-permissions",
        description: "Role with invalid permissions",
      };

      const request = new NextRequest("http://localhost:3000/api/admin/roles", {
        method: "POST",
        body: JSON.stringify(invalidRole),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Permissions must be an array");
    });

    it("should validate role name format", async () => {
      const invalidRole = {
        name: "invalid role name",
        permissions: ["read:users"],
        description: "Role with invalid name format",
      };

      const request = new NextRequest("http://localhost:3000/api/admin/roles", {
        method: "POST",
        body: JSON.stringify(invalidRole),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain(
        "Role name must be uppercase and contain only letters and underscores"
      );
    });

    it("should handle empty permissions array", async () => {
      const roleWithEmptyPermissions = {
        name: "EMPTY_ROLE",
        permissions: [],
        description: "Role with no permissions",
      };

      const createdRole = {
        id: "role-4",
        ...roleWithEmptyPermissions,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrisma.role.create.mockResolvedValue(createdRole);

      const request = new NextRequest("http://localhost:3000/api/admin/roles", {
        method: "POST",
        body: JSON.stringify(roleWithEmptyPermissions),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.permissions).toEqual([]);
    });

    it("should handle database errors", async () => {
      const newRole = {
        name: "TEST_ROLE",
        permissions: ["read:users"],
        description: "Test role",
      };

      mockPrisma.role.create.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/admin/roles", {
        method: "POST",
        body: JSON.stringify(newRole),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should handle malformed JSON", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/roles", {
        method: "POST",
        body: "invalid json",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid JSON");
    });
  });
});
