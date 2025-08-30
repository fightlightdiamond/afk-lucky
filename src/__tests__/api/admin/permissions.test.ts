import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/permissions/route";
import { getServerSession } from "next-auth";
import { createAbility } from "@/lib/ability";

// Mock dependencies
vi.mock("next-auth");
vi.mock("@/lib/ability");
vi.mock("@/services/permissionService", () => ({
  AVAILABLE_PERMISSIONS: [
    {
      id: "read:users",
      name: "Read Users",
      description: "View user information",
      category: "users",
    },
    {
      id: "create:users",
      name: "Create Users",
      description: "Create new users",
      category: "users",
    },
    {
      id: "update:users",
      name: "Update Users",
      description: "Modify user information",
      category: "users",
    },
    {
      id: "delete:users",
      name: "Delete Users",
      description: "Remove users from system",
      category: "users",
    },
    {
      id: "manage:roles",
      name: "Manage Roles",
      description: "Create, update, and delete roles",
      category: "roles",
    },
  ],
  PERMISSION_CATEGORIES: [
    {
      id: "users",
      name: "User Management",
      description: "Permissions related to user operations",
    },
    {
      id: "roles",
      name: "Role Management",
      description: "Permissions related to role operations",
    },
  ],
}));

const mockSession = {
  user: {
    id: "admin-user-id",
    email: "admin@example.com",
    role: "ADMIN",
  },
};

const mockAbility = {
  can: vi.fn(() => true),
  cannot: vi.fn(() => false),
};

describe("/api/admin/permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
    (createAbility as any).mockReturnValue(mockAbility);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /api/admin/permissions", () => {
    it("should return available permissions and categories", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/permissions"
      );
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.permissions).toBeDefined();
      expect(data.categories).toBeDefined();
      expect(data.permissions).toHaveLength(5);
      expect(data.categories).toHaveLength(2);
      expect(data.permissions[0]).toHaveProperty("id", "read:users");
      expect(data.permissions[0]).toHaveProperty("name", "Read Users");
      expect(data.permissions[0]).toHaveProperty("category", "users");
    });

    it("should return 401 when user is not authenticated", async () => {
      (getServerSession as any).mockResolvedValue(null);

      const response = await GET();

      expect(response.status).toBe(401);
    });

    it("should return 403 when user lacks permissions", async () => {
      mockAbility.cannot.mockReturnValue(true);

      const response = await GET();

      expect(response.status).toBe(403);
    });

    it("should handle server errors gracefully", async () => {
      (createAbility as any).mockImplementation(() => {
        throw new Error("Server error");
      });

      const response = await GET();

      expect(response.status).toBe(500);
    });

    it("should check for manage role permission", async () => {
      await GET();

      expect(mockAbility.cannot).toHaveBeenCalledWith("manage", "Role");
    });

    it("should return permissions with correct structure", async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            description: expect.any(String),
            category: expect.any(String),
          }),
        ])
      );

      expect(data.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            description: expect.any(String),
          }),
        ])
      );
    });

    it("should include all expected permission categories", async () => {
      const response = await GET();
      const data = await response.json();

      const categoryIds = data.categories.map((cat: any) => cat.id);
      expect(categoryIds).toContain("users");
      expect(categoryIds).toContain("roles");
    });

    it("should include all expected user permissions", async () => {
      const response = await GET();
      const data = await response.json();

      const permissionIds = data.permissions.map((perm: any) => perm.id);
      expect(permissionIds).toContain("read:users");
      expect(permissionIds).toContain("create:users");
      expect(permissionIds).toContain("update:users");
      expect(permissionIds).toContain("delete:users");
      expect(permissionIds).toContain("manage:roles");
    });
  });
});
