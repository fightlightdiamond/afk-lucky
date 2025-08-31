import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, PUT, DELETE } from "@/app/api/admin/roles/[id]/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { createAbility } from "@/lib/ability";

// Mock dependencies
vi.mock("next-auth", () => import("../../__mocks__/auth"));
vi.mock("@/lib/prisma", () => import("../../__mocks__/prisma"));
vi.mock("@/lib/ability", () => import("../../__mocks__/ability"));

// Import mocks after mocking
import { mockAbility } from "../../__mocks__/ability";

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

const mockRole = {
  id: "role-1",
  name: "USER",
  description: "Regular user role",
  permissions: ["read:profile", "update:profile"],
  created_at: new Date("2024-01-01"),
  updated_at: new Date("2024-01-01"),
};

describe.skip("/api/admin/roles/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
    (createAbility as any).mockReturnValue(mockAbility);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /api/admin/roles/[id]", () => {
    it("should return role by id", async () => {
      (prisma.role.findFirst as any).mockResolvedValue(mockRole);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1"
      );
      const response = await GET(request, { params: { id: "role-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe("role-1");
      expect(data.name).toBe("USER");
      expect(data.description).toBe("Regular user role");
      expect(data.permissions).toEqual(["read:profile", "update:profile"]);
      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: { id: "role-1" },
        select: {
          id: true,
          name: true,
          description: true,
          permissions: true,
          created_at: true,
          updated_at: true,
        },
      });
    });

    it("should return 404 when role not found", async () => {
      (prisma.role.findFirst as any).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/nonexistent"
      );
      const response = await GET(request, { params: { id: "nonexistent" } });

      expect(response.status).toBe(404);
    });

    it("should return 401 when user is not authenticated", async () => {
      (getServerSession as any).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1"
      );
      const response = await GET(request, { params: { id: "role-1" } });

      expect(response.status).toBe(401);
    });

    it("should return 403 when user lacks read permissions", async () => {
      mockAbility.cannot.mockReturnValue(true);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1"
      );
      const response = await GET(request, { params: { id: "role-1" } });

      expect(response.status).toBe(403);
      expect(mockAbility.cannot).toHaveBeenCalledWith("read", "Role");
    });

    it("should handle database errors gracefully", async () => {
      (prisma.role.findFirst as any).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1"
      );
      const response = await GET(request, { params: { id: "role-1" } });

      expect(response.status).toBe(500);
    });
  });

  describe("PUT /api/admin/roles/[id]", () => {
    const updateData = {
      name: "UPDATED_USER",
      description: "Updated user role",
      permissions: ["read:profile", "update:profile", "delete:profile"],
    };

    it("should update role successfully", async () => {
      const updatedRole = {
        ...mockRole,
        ...updateData,
        updated_at: new Date(),
      };
      (prisma.role.update as any).mockResolvedValue(updatedRole);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, { params: { id: "role-1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe("UPDATED_USER");
      expect(data.description).toBe("Updated user role");
      expect(data.permissions).toEqual([
        "read:profile",
        "update:profile",
        "delete:profile",
      ]);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: "role-1" },
        data: {
          name: "UPDATED_USER",
          description: "Updated user role",
          permissions: {
            set: ["read:profile", "update:profile", "delete:profile"],
          },
        },
      });
    });

    it("should return 400 when name is missing", async () => {
      const invalidData = {
        description: "Updated description",
        permissions: ["read:profile"],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "PUT",
          body: JSON.stringify(invalidData),
        }
      );

      const response = await PUT(request, { params: { id: "role-1" } });

      expect(response.status).toBe(400);
    });

    it("should return 400 when permissions is not an array", async () => {
      const invalidData = {
        name: "UPDATED_USER",
        description: "Updated description",
        permissions: "invalid",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "PUT",
          body: JSON.stringify(invalidData),
        }
      );

      const response = await PUT(request, { params: { id: "role-1" } });

      expect(response.status).toBe(400);
    });

    it("should return 401 when user is not authenticated", async () => {
      (getServerSession as any).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, { params: { id: "role-1" } });

      expect(response.status).toBe(401);
    });

    it("should return 403 when user lacks update permissions", async () => {
      mockAbility.cannot.mockReturnValue(true);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, { params: { id: "role-1" } });

      expect(response.status).toBe(403);
      expect(mockAbility.cannot).toHaveBeenCalledWith("update", "Role");
    });

    it("should handle invalid JSON in request body", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "PUT",
          body: "invalid json",
        }
      );

      const response = await PUT(request, { params: { id: "role-1" } });

      expect(response.status).toBe(500);
    });

    it("should handle database errors gracefully", async () => {
      (prisma.role.update as any).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, { params: { id: "role-1" } });

      expect(response.status).toBe(500);
    });
  });

  describe("DELETE /api/admin/roles/[id]", () => {
    it("should delete role successfully when not assigned to users", async () => {
      (prisma.user.count as any).mockResolvedValue(0);
      (prisma.role.delete as any).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "role-1" } });

      expect(response.status).toBe(204);
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { role_id: "role-1" },
      });
      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: "role-1" },
      });
    });

    it("should return 400 when role is assigned to users", async () => {
      (prisma.user.count as any).mockResolvedValue(5);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "role-1" } });

      expect(response.status).toBe(400);
      expect(prisma.role.delete).not.toHaveBeenCalled();
    });

    it("should return 401 when user is not authenticated", async () => {
      (getServerSession as any).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "role-1" } });

      expect(response.status).toBe(401);
    });

    it("should return 403 when user lacks delete permissions", async () => {
      mockAbility.cannot.mockReturnValue(true);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "role-1" } });

      expect(response.status).toBe(403);
      expect(mockAbility.cannot).toHaveBeenCalledWith("delete", "Role");
    });

    it("should handle database errors gracefully", async () => {
      (prisma.user.count as any).mockResolvedValue(0);
      (prisma.role.delete as any).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "role-1" } });

      expect(response.status).toBe(500);
    });

    it("should check user count before attempting deletion", async () => {
      (prisma.user.count as any).mockResolvedValue(3);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/roles/role-1",
        {
          method: "DELETE",
        }
      );

      await DELETE(request, { params: { id: "role-1" } });

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { role_id: "role-1" },
      });
    });
  });
});
