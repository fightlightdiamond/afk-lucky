import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "@/app/api/admin/users/check-email/route";
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

describe("/api/admin/users/check-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-id", email: "admin@test.com", role: "ADMIN" },
    });
  });

  describe("GET", () => {
    it("should return available when email is not taken", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const url = new URL(
        "http://localhost:3000/api/admin/users/check-email?email=new@test.com"
      );
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "new@test.com" },
        select: { id: true },
      });
    });

    it("should return not available when email is taken", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "existing-user-id" });

      const url = new URL(
        "http://localhost:3000/api/admin/users/check-email?email=existing@test.com"
      );
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "existing@test.com" },
        select: { id: true },
      });
    });

    it("should return available when email belongs to excluded user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-to-exclude" });

      const url = new URL(
        "http://localhost:3000/api/admin/users/check-email?email=existing@test.com&excludeUserId=user-to-exclude"
      );
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });

    it("should return not available when email belongs to different user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "different-user-id" });

      const url = new URL(
        "http://localhost:3000/api/admin/users/check-email?email=existing@test.com&excludeUserId=user-to-exclude"
      );
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
    });

    it("should handle missing email parameter", async () => {
      const url = new URL("http://localhost:3000/api/admin/users/check-email");
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Email is required");
    });

    it("should handle invalid email format", async () => {
      const url = new URL(
        "http://localhost:3000/api/admin/users/check-email?email=invalid-email"
      );
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid email format");
    });

    it("should handle database errors", async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      const url = new URL(
        "http://localhost:3000/api/admin/users/check-email?email=test@test.com"
      );
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should handle unauthorized access", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const url = new URL(
        "http://localhost:3000/api/admin/users/check-email?email=test@test.com"
      );
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should validate email format correctly", async () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
      ];

      const invalidEmails = [
        "invalid-email",
        "@domain.com",
        "user@",
        "user..name@domain.com",
      ];

      for (const email of validEmails) {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        const url = new URL(
          `http://localhost:3000/api/admin/users/check-email?email=${encodeURIComponent(
            email
          )}`
        );
        const request = new NextRequest(url);
        const response = await GET(request);
        expect(response.status).toBe(200);
      }

      for (const email of invalidEmails) {
        const url = new URL(
          `http://localhost:3000/api/admin/users/check-email?email=${encodeURIComponent(
            email
          )}`
        );
        const request = new NextRequest(url);
        const response = await GET(request);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid email format");
      }
    });
  });
});
