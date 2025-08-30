import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, PUT, DELETE } from "@/app/api/admin/users/[id]/route";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

// Mock dependencies
vi.mock("@/lib/prisma");
vi.mock("next-auth");
vi.mock("bcryptjs");
vi.mock("@/lib/ability", () => ({
  createAbilityForUser: vi.fn(() => ({
    can: vi.fn(() => true),
  })),
}));

const mockPrisma = prisma as any;
const mockGetServerSession = getServerSession as any;
const mockBcrypt = bcrypt as any;

describe("/api/admin/users/[id]", () => {
  const mockUser = {
    id: "user-id",
    email: "user@test.com",
    first_name: "John",
    last_name: "Doe",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    role: {
      id: "role-id",
      name: "USER",
      permissions: ["read:users"],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-id", email: "admin@test.com", role: "ADMIN" },
    });
  });

  describe("GET", () => {
    it("should return user by id", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id"
      );
      const response = await GET(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe("user-id");
      expect(data.email).toBe("user@test.com");
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-id" },
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
    });

    it("should return 404 when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/nonexistent"
      );
      const response = await GET(request, { params: { id: "nonexistent" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    it("should handle database errors", async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id"
      );
      const response = await GET(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("PUT", () => {
    it("should update user successfully", async () => {
      const updateData = {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@test.com",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.first_name).toBe("Jane");
      expect(data.last_name).toBe("Smith");
      expect(data.email).toBe("jane@test.com");
    });

    it("should update user with password", async () => {
      const updateData = {
        first_name: "Jane",
        password: "newpassword123",
      };

      mockBcrypt.hash.mockResolvedValue("hashed-password");
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
        password: "hashed-password",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockBcrypt.hash).toHaveBeenCalledWith("newpassword123", 12);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-id" },
        data: {
          first_name: "Jane",
          password: "hashed-password",
        },
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
    });

    it("should handle email conflicts", async () => {
      const updateData = {
        email: "existing@test.com",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockRejectedValue({
        code: "P2002",
        meta: { target: ["email"] },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Email already exists");
    });

    it("should return 404 when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/nonexistent",
        {
          method: "PUT",
          body: JSON.stringify({ first_name: "Jane" }),
        }
      );

      const response = await PUT(request, { params: { id: "nonexistent" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    it("should validate required fields", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id",
        {
          method: "PUT",
          body: JSON.stringify({}),
        }
      );

      const response = await PUT(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("At least one field must be provided");
    });

    it("should validate email format", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id",
        {
          method: "PUT",
          body: JSON.stringify({ email: "invalid-email" }),
        }
      );

      const response = await PUT(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid email format");
    });

    it("should validate password strength", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id",
        {
          method: "PUT",
          body: JSON.stringify({ password: "weak" }),
        }
      );

      const response = await PUT(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Password must be at least 8 characters");
    });
  });

  describe("DELETE", () => {
    it("should delete user successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("User deleted successfully");
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: "user-id" },
      });
    });

    it("should prevent admin from deleting themselves", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        id: "admin-id",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/admin-id",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "admin-id" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Cannot delete your own account");
    });

    it("should return 404 when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/nonexistent",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "nonexistent" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    it("should handle database errors", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.delete.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("Authorization", () => {
    it("should handle unauthorized access", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/user-id"
      );
      const response = await GET(request, { params: { id: "user-id" } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });
});
