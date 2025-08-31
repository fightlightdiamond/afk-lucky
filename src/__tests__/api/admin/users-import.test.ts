import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { POST } from "@/app/api/admin/users/import/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { createAbility } from "@/lib/ability";
import * as XLSX from "xlsx";

// Mock dependencies
vi.mock("next-auth", () => import("../../__mocks__/auth"));
vi.mock("@/lib/prisma", () => import("../../__mocks__/prisma"));
vi.mock("@/lib/ability", () => import("../../__mocks__/ability"));
vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Import mocks after mocking
import { mockAbility } from "../../__mocks__/ability";

vi.mock("xlsx", () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  hash: vi.fn().mockResolvedValue("hashed_password"),
}));

const mockSession = {
  user: {
    id: "user-1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: {
      id: "role-2",
      name: "ADMIN",
      permissions: ["user:create", "user:read", "user:update", "user:delete"],
    },
    isActive: true,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

const mockRoles = [
  { id: "role-1", name: "USER" },
  { id: "role-2", name: "ADMIN" },
];

// Helper function to create mock request
const createMockRequest = (file: any, options?: any) => {
  const mockFormData = new Map();
  if (file) {
    mockFormData.set("file", file);
  }
  if (options) {
    mockFormData.set("options", JSON.stringify(options));
  }

  return {
    formData: vi.fn().mockResolvedValue(mockFormData),
  } as any;
};

// Helper function to create mock file
const createMockFile = (name: string, type: string, size: number = 1000) => ({
  name,
  type,
  size,
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
});

describe("/api/admin/users/import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
    (mockAbility.can as any).mockReturnValue(true);
    (createAbility as any).mockReturnValue(mockAbility);
    (prisma.role.findMany as any).mockResolvedValue(mockRoles);
    (prisma.user.findMany as any).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST", () => {
    it("should require authentication", async () => {
      (getServerSession as any).mockResolvedValue(null);

      const mockFile = createMockFile("test.csv", "text/csv");
      const mockRequest = createMockRequest(mockFile);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should require proper permissions", async () => {
      (mockAbility.can as any).mockReturnValue(false);

      const mockFile = createMockFile("test.csv", "text/csv");
      const mockRequest = createMockRequest(mockFile);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INSUFFICIENT_PERMISSIONS");
    });

    it("should require a file", async () => {
      const mockRequest = createMockRequest(null);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should validate file size", async () => {
      const mockFile = createMockFile("test.csv", "text/csv", 11 * 1024 * 1024);
      const mockRequest = createMockRequest(mockFile);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FILE_TOO_LARGE");
    });

    it("should validate file type", async () => {
      const mockFile = createMockFile("test.txt", "text/plain");
      const mockRequest = createMockRequest(mockFile);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNSUPPORTED_FILE_FORMAT");
    });

    it("should handle validation-only requests", async () => {
      const csvData = [
        {
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
          password: "password123",
        },
      ];

      (XLSX.read as any).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      });
      (XLSX.utils.sheet_to_json as any).mockReturnValue(csvData);

      const mockFile = createMockFile("test.csv", "text/csv");
      const mockRequest = createMockRequest(mockFile, { validateOnly: true });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary.validRows).toBe(1);
      expect(data.summary.created).toBe(0); // No actual creation in validation mode
      expect(data.previewData).toHaveLength(1);
    });

    it("should successfully import valid users", async () => {
      const csvData = [
        {
          email: "test1@example.com",
          first_name: "Test1",
          last_name: "User1",
          password: "password123",
        },
        {
          email: "test2@example.com",
          first_name: "Test2",
          last_name: "User2",
          password: "password456",
        },
      ];

      (XLSX.read as any).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      });
      (XLSX.utils.sheet_to_json as any).mockReturnValue(csvData);
      (prisma.user.create as any).mockResolvedValue({});

      const mockFile = createMockFile("test.csv", "text/csv");
      const mockRequest = createMockRequest(mockFile, {
        skipDuplicates: false,
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary.created).toBe(2);
      expect(data.summary.validRows).toBe(2);
      expect(prisma.user.create).toHaveBeenCalledTimes(2);
    });

    it("should handle duplicate emails based on options", async () => {
      const csvData = [
        {
          email: "existing@example.com",
          first_name: "Test",
          last_name: "User",
          password: "password123",
        },
      ];

      (XLSX.read as any).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      });
      (XLSX.utils.sheet_to_json as any).mockReturnValue(csvData);
      (prisma.user.findMany as any).mockResolvedValue([
        { email: "existing@example.com" },
      ]);

      const mockFile = createMockFile("test.csv", "text/csv");
      const mockRequest = createMockRequest(mockFile, { skipDuplicates: true });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary.created).toBe(0);
      expect(data.warnings).toHaveLength(1);
      expect(data.warnings[0].message).toContain("already exists, skipping");
    });

    it("should update existing users when updateExisting is true", async () => {
      const csvData = [
        {
          email: "existing@example.com",
          first_name: "Updated",
          last_name: "User",
        },
      ];

      (XLSX.read as any).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      });
      (XLSX.utils.sheet_to_json as any).mockReturnValue(csvData);
      (prisma.user.findMany as any).mockResolvedValue([
        { email: "existing@example.com" },
      ]);
      (prisma.user.update as any).mockResolvedValue({});

      const mockFile = createMockFile("test.csv", "text/csv");
      const mockRequest = createMockRequest(mockFile, { updateExisting: true });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary.updated).toBe(1);
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
    });

    it("should handle validation errors", async () => {
      const csvData = [
        {
          email: "invalid-email",
          first_name: "",
          last_name: "User",
        },
      ];

      (XLSX.read as any).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      });
      (XLSX.utils.sheet_to_json as any).mockReturnValue(csvData);

      const mockFile = createMockFile("test.csv", "text/csv");
      const mockRequest = createMockRequest(mockFile, {
        skipInvalidRows: true,
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.summary.invalidRows).toBe(1);
      expect(data.errors.length).toBeGreaterThan(0);
    });

    it("should apply field mapping", async () => {
      const csvData = [
        {
          "Email Address": "test@example.com",
          "First Name": "Test",
          "Last Name": "User",
        },
      ];

      (XLSX.read as any).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      });
      (XLSX.utils.sheet_to_json as any).mockReturnValue(csvData);
      (prisma.user.create as any).mockResolvedValue({});

      const fieldMapping = {
        "Email Address": "email",
        "First Name": "first_name",
        "Last Name": "last_name",
      };

      const mockFile = createMockFile("test.csv", "text/csv");
      const mockRequest = createMockRequest(mockFile, { fieldMapping });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.summary.created).toBe(1);
    });

    it("should handle role name to ID conversion", async () => {
      const csvData = [
        {
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
          role: "USER",
        },
      ];

      (XLSX.read as any).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      });
      (XLSX.utils.sheet_to_json as any).mockReturnValue(csvData);
      (prisma.user.create as any).mockResolvedValue({});

      const mockFile = createMockFile("test.csv", "text/csv");
      const mockRequest = createMockRequest(mockFile);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role_id: "role-1", // Should convert "USER" to role-1
        }),
      });
    });

    it("should generate passwords for users without passwords", async () => {
      const csvData = [
        {
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
          // No password provided
        },
      ];

      (XLSX.read as any).mockReturnValue({
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      });
      (XLSX.utils.sheet_to_json as unknown).mockReturnValue(csvData);
      (prisma.user.create as unknown).mockResolvedValue({});

      const mockFile = createMockFile("test.csv", "text/csv");
      const mockRequest = createMockRequest(mockFile);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.warnings).toHaveLength(1);
      expect(data.warnings[0].message).toContain(
        "Generated temporary password"
      );
    });
  });
});
