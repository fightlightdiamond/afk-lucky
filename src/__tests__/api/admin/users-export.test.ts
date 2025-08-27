import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/users/export/route";
import { getServerSession } from "next-auth";
import { createAbility } from "@/lib/ability";
import prisma from "@/lib/prisma";

// Mock dependencies
vi.mock("next-auth");
vi.mock("@/lib/ability");
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const mockGetServerSession = vi.mocked(getServerSession);
const mockCreateAbility = vi.mocked(createAbility);
const mockPrisma = vi.mocked(prisma);

describe("/api/admin/users/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should require authentication", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/export"
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Authentication required");
    });

    it("should require read permissions", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "test@example.com" },
      } as any);

      const mockAbility = {
        cannot: vi.fn().mockReturnValue(true),
      };
      mockCreateAbility.mockReturnValue(mockAbility as any);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/export"
      );
      const response = await GET(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe("Insufficient permissions to export users");
    });

    it("should export users as CSV", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "admin@example.com" },
      } as any);

      const mockAbility = {
        cannot: vi.fn().mockReturnValue(false),
      };
      mockCreateAbility.mockReturnValue(mockAbility as any);

      mockPrisma.user.count.mockResolvedValue(2);
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "1",
          email: "user1@example.com",
          first_name: "John",
          last_name: "Doe",
          is_active: true,
          created_at: new Date("2023-01-01"),
          updated_at: new Date("2023-01-01"),
          last_login: new Date("2023-01-02"),
          last_logout: null,
          avatar: null,
          sex: true,
          birthday: new Date("1990-01-01"),
          address: "123 Main St",
          deleted_at: null,
          coin: BigInt(100),
          locale: "en",
          group_id: 1,
          role_id: "role1",
          role: {
            id: "role1",
            name: "USER",
            description: "Regular user",
          },
        },
        {
          id: "2",
          email: "user2@example.com",
          first_name: "Jane",
          last_name: "Smith",
          is_active: false,
          created_at: new Date("2023-01-01"),
          updated_at: new Date("2023-01-01"),
          last_login: null,
          last_logout: null,
          avatar: "avatar.jpg",
          sex: false,
          birthday: null,
          address: "",
          deleted_at: null,
          coin: BigInt(0),
          locale: "es",
          group_id: null,
          role_id: null,
          role: null,
        },
      ] as any);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/export?format=csv"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("text/csv");
      expect(response.headers.get("Content-Disposition")).toContain(
        "attachment"
      );

      const content = await response.text();
      expect(content).toContain("Id,Email,First Name,Last Name");
      expect(content).toContain("user1@example.com");
      expect(content).toContain("user2@example.com");
    });

    it("should export users as JSON", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "admin@example.com" },
      } as any);

      const mockAbility = {
        cannot: vi.fn().mockReturnValue(false),
      };
      mockCreateAbility.mockReturnValue(mockAbility as any);

      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "1",
          email: "user1@example.com",
          first_name: "John",
          last_name: "Doe",
          is_active: true,
          created_at: new Date("2023-01-01"),
          updated_at: new Date("2023-01-01"),
          last_login: new Date("2023-01-02"),
          last_logout: null,
          avatar: null,
          sex: true,
          birthday: new Date("1990-01-01"),
          address: "123 Main St",
          deleted_at: null,
          coin: BigInt(100),
          locale: "en",
          group_id: 1,
          role_id: "role1",
          role: {
            id: "role1",
            name: "USER",
            description: "Regular user",
          },
        },
      ] as any);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/export?format=json"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");

      const content = await response.text();
      const data = JSON.parse(content);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty("email", "user1@example.com");
      expect(data[0]).toHaveProperty("full_name", "John Doe");
    });

    it("should reject export if too many records", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "admin@example.com" },
      } as any);

      const mockAbility = {
        cannot: vi.fn().mockReturnValue(false),
      };
      mockCreateAbility.mockReturnValue(mockAbility as any);

      mockPrisma.user.count.mockResolvedValue(15000); // Over the limit

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/export?format=csv"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Export limit exceeded");
    });

    it("should handle unsupported format", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "1", email: "admin@example.com" },
      } as any);

      const mockAbility = {
        cannot: vi.fn().mockReturnValue(false),
      };
      mockCreateAbility.mockReturnValue(mockAbility as any);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/export?format=pdf"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Unsupported export format");
    });
  });
});
