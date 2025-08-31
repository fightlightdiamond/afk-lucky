import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/users/export/route";
import { getServerSession } from "next-auth";
import { createAbility } from "@/lib/ability";
import { prisma } from "@/lib/prisma";

// Mock dependencies
vi.mock("next-auth", () => import("../../__mocks__/auth"));
vi.mock("@/lib/ability", () => import("../../__mocks__/ability"));
vi.mock("@/lib/prisma", () => import("../../__mocks__/prisma"));
vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Import mocks after mocking
import { mockAbility } from "../../__mocks__/ability";

// Mock external libraries
vi.mock("json2csv", () => ({
  Parser: vi.fn().mockImplementation(() => ({
    parse: vi
      .fn()
      .mockReturnValue(
        "id,email,first_name,last_name\n1,user1@example.com,John,Doe"
      ),
  })),
}));

vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn().mockReturnValue({}),
    json_to_sheet: vi.fn().mockReturnValue({}),
    book_append_sheet: vi.fn(),
    aoa_to_sheet: vi.fn().mockReturnValue({}),
  },
  write: vi.fn().mockReturnValue(Buffer.from("mock excel content")),
}));

vi.mock("jspdf", () => {
  return {
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
      text: vi.fn(),
      setFontSize: vi.fn(),
      output: vi.fn().mockReturnValue(Buffer.from("mock pdf content")),
    })),
  };
});

vi.mock("jspdf-autotable", () => ({
  __esModule: true,
  default: vi.fn(),
}));

const mockSession = {
  user: {
    id: "1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: {
      id: "role-1",
      name: "ADMIN",
      permissions: ["user:read", "user:create", "user:update", "user:delete"],
    },
    isActive: true,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

describe("/api/admin/users/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
    (mockAbility.cannot as any).mockReturnValue(false);
    (mockAbility.can as any).mockReturnValue(true);
    (createAbility as any).mockReturnValue(mockAbility);
  });

  describe("GET", () => {
    it("should require authentication", async () => {
      (getServerSession as any).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/export"
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Authentication required");
    });

    it("should require read permissions", async () => {
      (mockAbility.cannot as any).mockReturnValue(true);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/export"
      );
      const response = await GET(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe("Insufficient permissions to export users");
    });

    it("should export users as CSV", async () => {
      (prisma.user.count as any).mockResolvedValue(2);
      (prisma.user.findMany as any).mockResolvedValue([
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
          coin: BigInt(100),
          locale: "en",
          group_id: 1,
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
          coin: BigInt(0),
          locale: "es",
          group_id: null,
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
      expect(content).toContain("user1@example.com");
    });

    it("should export users as JSON", async () => {
      (prisma.user.count as any).mockResolvedValue(1);
      (prisma.user.findMany as any).mockResolvedValue([
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
          coin: BigInt(100),
          locale: "en",
          group_id: 1,
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
      expect(data).toHaveProperty("data");
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data[0]).toHaveProperty("email", "user1@example.com");
      expect(data.data[0]).toHaveProperty("full_name", "John Doe");
    });

    it("should reject export if too many records", async () => {
      (prisma.user.count as any).mockResolvedValue(15000); // Over the limit

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/export?format=csv"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Export limit exceeded");
    });

    it("should handle unsupported format", async () => {
      (prisma.user.count as any).mockResolvedValue(100); // Reset to a reasonable number

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/export?format=xml"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid export format");
    });
  });
});
