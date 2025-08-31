import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/admin/users/route";
import { POST as BulkPOST } from "@/app/api/admin/users/bulk/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { createAbility } from "@/lib/ability";
import bcrypt from "bcryptjs";
import { UserManagementErrorCodes } from "@/types/user";

// Mock dependencies
vi.mock("next-auth", () => import("../../__mocks__/auth"));
vi.mock("@/lib/prisma", () => import("../../__mocks__/prisma"));
vi.mock("@/lib/ability", () => import("../../__mocks__/ability"));
vi.mock("bcryptjs");

// Import mocks after mocking
import { mockAbility } from "../../__mocks__/ability";

const mockSession = {
  user: {
    id: "admin-user-id",
    email: "admin@example.com",
    role: "ADMIN",
  },
};

const mockUsers = [
  {
    id: "user-1",
    email: "user1@example.com",
    first_name: "John",
    last_name: "Doe",
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
    last_login: new Date("2024-01-15"),
    last_logout: null,
    avatar: null,
    role: {
      id: "role-1",
      name: "USER",
      permissions: ["read:profile"],
      description: "Regular user",
    },
  },
  {
    id: "user-2",
    email: "user2@example.com",
    first_name: "Jane",
    last_name: "Smith",
    is_active: false,
    created_at: new Date("2024-01-02"),
    updated_at: new Date("2024-01-02"),
    last_login: null,
    last_logout: null,
    avatar: null,
    role: null,
  },
];

describe("/api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
    (createAbility as any).mockReturnValue(mockAbility);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /api/admin/users", () => {
    it("should return users with pagination", async () => {
      const mockPrismaUsers = mockUsers.map((user) => ({
        ...user,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login,
        sex: true,
        birthday: null,
        address: null,
        remember_token: null,
        slack_webhook_url: null,
        deleted_at: null,
        coin: BigInt(1000),
        locale: "en",
        group_id: 1,
        role_id: user.role?.id || null,
      }));

      (prisma.user.findMany as any).mockResolvedValue(mockPrismaUsers);
      (prisma.user.count as any).mockResolvedValue(2);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
        { role_id: null, is_active: false, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?page=1&pageSize=10"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toHaveLength(2);
      expect(data.pagination).toMatchObject({
        page: 1,
        pageSize: 10,
        total: 2,
      });
      expect(data.users[0]).toHaveProperty("full_name", "John Doe");
      expect(data.users[0]).toHaveProperty("status", "active");
    });

    it("should filter users by search term", async () => {
      const filteredUsers = [
        {
          ...mockUsers[0],
          sex: true,
          birthday: null,
          address: null,
          remember_token: null,
          slack_webhook_url: null,
          deleted_at: null,
          coin: BigInt(1000),
          locale: "en",
          group_id: 1,
          role_id: "role-1",
        },
      ];
      (prisma.user.findMany as any).mockResolvedValue(filteredUsers);
      (prisma.user.count as any).mockResolvedValue(1);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?search=john"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toHaveLength(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { first_name: { contains: "john", mode: "insensitive" } },
                  { last_name: { contains: "john", mode: "insensitive" } },
                  { email: { contains: "john", mode: "insensitive" } },
                ]),
              }),
            ]),
          }),
        })
      );
    });

    it("should filter users by role", async () => {
      const filteredUsers = [
        {
          ...mockUsers[0],
          sex: true,
          birthday: null,
          address: null,
          remember_token: null,
          slack_webhook_url: null,
          deleted_at: null,
          coin: BigInt(1000),
          locale: "en",
          group_id: 1,
          role_id: "role-1",
        },
      ];
      (prisma.user.findMany as any).mockResolvedValue(filteredUsers);
      (prisma.user.count as any).mockResolvedValue(1);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);
      (prisma.role.findUnique as any).mockResolvedValue({
        id: "role-1",
        name: "USER",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?role=role-1"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                role_id: "role-1",
              }),
            ]),
          }),
        })
      );
    });

    it("should filter users by status", async () => {
      const activeUsers = [
        {
          ...mockUsers[0],
          sex: true,
          birthday: null,
          address: null,
          remember_token: null,
          slack_webhook_url: null,
          deleted_at: null,
          coin: BigInt(1000),
          locale: "en",
          group_id: 1,
          role_id: "role-1",
        },
      ];
      (prisma.user.findMany as any).mockResolvedValue(activeUsers);
      (prisma.user.count as any).mockResolvedValue(1);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?status=active"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                is_active: true,
              }),
            ]),
          }),
        })
      );
    });

    it("should sort users by different fields", async () => {
      const mockPrismaUsers = mockUsers.map((user) => ({
        ...user,
        sex: true,
        birthday: null,
        address: null,
        remember_token: null,
        slack_webhook_url: null,
        deleted_at: null,
        coin: BigInt(1000),
        locale: "en",
        group_id: 1,
        role_id: user.role?.id || null,
      }));

      (prisma.user.findMany as any).mockResolvedValue(mockPrismaUsers);
      (prisma.user.count as any).mockResolvedValue(2);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
        { role_id: null, is_active: false, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?sortBy=email&sortOrder=asc"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ email: "asc" }],
        })
      );
    });

    it("should return 401 when user is not authenticated", async () => {
      (getServerSession as any).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/admin/users");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("should return 403 when user lacks permissions", async () => {
      mockAbility.cannot.mockReturnValue(true);

      const request = new NextRequest("http://localhost:3000/api/admin/users");
      const response = await GET(request);

      expect(response.status).toBe(403);
    });

    it("should handle database errors gracefully", async () => {
      (prisma.user.findMany as any).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest("http://localhost:3000/api/admin/users");
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Failed to fetch users");
    });

    it("should filter users by date range", async () => {
      const filteredUsers = [
        {
          ...mockUsers[0],
          sex: true,
          birthday: null,
          address: null,
          remember_token: null,
          slack_webhook_url: null,
          deleted_at: null,
          coin: BigInt(1000),
          locale: "en",
          group_id: 1,
          role_id: "role-1",
        },
      ];
      (prisma.user.findMany as any).mockResolvedValue(filteredUsers);
      (prisma.user.count as any).mockResolvedValue(1);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?dateFrom=2024-01-01&dateTo=2024-01-31"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                created_at: expect.objectContaining({
                  gte: expect.any(Date),
                  lte: expect.any(Date),
                }),
              }),
            ]),
          }),
        })
      );
    });

    it("should filter users by activity status", async () => {
      const filteredUsers = [
        {
          ...mockUsers[1],
          sex: true,
          birthday: null,
          address: null,
          remember_token: null,
          slack_webhook_url: null,
          deleted_at: null,
          coin: BigInt(1000),
          locale: "en",
          group_id: 1,
          role_id: null,
        },
      ];
      (prisma.user.findMany as any).mockResolvedValue(filteredUsers);
      (prisma.user.count as any).mockResolvedValue(1);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: null, is_active: false, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?activity_status=never"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                last_login: null,
              }),
            ]),
          }),
        })
      );
    });

    it("should validate pagination parameters", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?page=0&pageSize=1000"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe("INVALID_PAGINATION_PARAMS");
    });

    it("should validate sort parameters", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?sortBy=invalid_field"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe("INVALID_PAGINATION_PARAMS");
    });

    it("should return metadata with user statistics", async () => {
      const mockPrismaUsers = mockUsers.map((user) => ({
        ...user,
        sex: true,
        birthday: null,
        address: null,
        remember_token: null,
        slack_webhook_url: null,
        deleted_at: null,
        coin: BigInt(1000),
        locale: "en",
        group_id: 1,
        role_id: user.role?.id || null,
      }));

      (prisma.user.findMany as any).mockResolvedValue(mockPrismaUsers);
      (prisma.user.count as any).mockResolvedValue(2);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
        { role_id: null, is_active: false, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);

      const request = new NextRequest("http://localhost:3000/api/admin/users");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metadata).toBeDefined();
      expect(data.metadata.totalActiveUsers).toBe(1);
      expect(data.metadata.totalInactiveUsers).toBe(1);
      expect(data.metadata.availableRoles).toHaveLength(1);
      expect(data.metadata.queryPerformance).toBeDefined();
    });

    it("should handle empty search results gracefully", async () => {
      (prisma.user.findMany as any).mockResolvedValue([]);
      (prisma.user.count as any).mockResolvedValue(0);
      (prisma.user.groupBy as any).mockResolvedValue([]);
      (prisma.role.findMany as any).mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?search=nonexistent"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
      expect(data.metadata.totalActiveUsers).toBe(0);
      expect(data.metadata.totalInactiveUsers).toBe(0);
    });

    it("should handle very large page numbers", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?page=999999&pageSize=10"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toHaveLength(0);
      expect(data.pagination.page).toBe(999999);
    });

    it("should handle invalid date formats gracefully", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?dateFrom=invalid-date&dateTo=also-invalid"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe(
        UserManagementErrorCodes.INVALID_PAGINATION_PARAMS
      );
      expect(data.details.errors).toEqual(
        expect.arrayContaining([
          "Invalid dateFrom format",
          "Invalid dateTo format",
        ])
      );
    });

    it("should handle role filter by name", async () => {
      const filteredUsers = [
        {
          ...mockUsers[0],
          sex: true,
          birthday: null,
          address: null,
          remember_token: null,
          slack_webhook_url: null,
          deleted_at: null,
          coin: BigInt(1000),
          locale: "en",
          group_id: 1,
          role_id: "role-1",
        },
      ];
      (prisma.user.findMany as any).mockResolvedValue(filteredUsers);
      (prisma.user.count as any).mockResolvedValue(1);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);
      (prisma.role.findUnique as any).mockResolvedValue({
        id: "role-1",
        name: "USER",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?role=USER"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: "USER" },
        select: { id: true },
      });
    });

    it("should handle invalid role filter", async () => {
      (prisma.role.findUnique as any).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?role=INVALID_ROLE"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe(UserManagementErrorCodes.INVALID_ROLE);
    });

    it("should handle complex search with multiple words", async () => {
      const filteredUsers = [
        {
          ...mockUsers[0],
          sex: true,
          birthday: null,
          address: null,
          remember_token: null,
          slack_webhook_url: null,
          deleted_at: null,
          coin: BigInt(1000),
          locale: "en",
          group_id: 1,
          role_id: "role-1",
        },
      ];
      (prisma.user.findMany as any).mockResolvedValue(filteredUsers);
      (prisma.user.count as any).mockResolvedValue(1);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?search=John Doe"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { first_name: { contains: "John Doe", mode: "insensitive" } },
                  { last_name: { contains: "John Doe", mode: "insensitive" } },
                  { email: { contains: "John Doe", mode: "insensitive" } },
                  expect.objectContaining({
                    AND: [
                      { first_name: { contains: "John", mode: "insensitive" } },
                      { last_name: { contains: "Doe", mode: "insensitive" } },
                    ],
                  }),
                ]),
              }),
            ]),
          }),
        })
      );
    });

    it("should handle locale and group filters", async () => {
      const filteredUsers = [
        {
          ...mockUsers[0],
          sex: true,
          birthday: null,
          address: null,
          remember_token: null,
          slack_webhook_url: null,
          deleted_at: null,
          coin: BigInt(1000),
          locale: "en",
          group_id: 1,
          role_id: "role-1",
        },
      ];
      (prisma.user.findMany as any).mockResolvedValue(filteredUsers);
      (prisma.user.count as any).mockResolvedValue(1);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?locale=en&group_id=1"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({ locale: "en" }),
              expect.objectContaining({ group_id: 1 }),
            ]),
          }),
        })
      );
    });

    it("should handle avatar filter", async () => {
      const filteredUsers = [
        {
          ...mockUsers[0],
          sex: true,
          birthday: null,
          address: null,
          remember_token: null,
          slack_webhook_url: null,
          deleted_at: null,
          coin: BigInt(1000),
          locale: "en",
          group_id: 1,
          role_id: "role-1",
          avatar: "avatar-url.jpg",
        },
      ];
      (prisma.user.findMany as any).mockResolvedValue(filteredUsers);
      (prisma.user.count as any).mockResolvedValue(1);
      (prisma.user.groupBy as any).mockResolvedValue([
        { role_id: "role-1", is_active: true, _count: { id: 1 } },
      ]);
      (prisma.role.findMany as any).mockResolvedValue([
        {
          id: "role-1",
          name: "USER",
          description: "Regular user",
          _count: { users: 1 },
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?hasAvatar=true"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({ avatar: { not: null } }),
            ]),
          }),
        })
      );
    });

    it("should handle Prisma validation errors", async () => {
      const prismaValidationError = new Error("Validation error");
      prismaValidationError.name = "PrismaClientValidationError";
      (prisma.user.findMany as any).mockRejectedValue(prismaValidationError);

      const request = new NextRequest("http://localhost:3000/api/admin/users");
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe(UserManagementErrorCodes.VALIDATION_ERROR);
    });

    it("should handle Prisma known request errors", async () => {
      const prismaKnownError = {
        name: "PrismaClientKnownRequestError",
        code: "P2002",
        message: "Unique constraint failed",
      };
      (prisma.user.findMany as any).mockRejectedValue(prismaKnownError);

      const request = new NextRequest("http://localhost:3000/api/admin/users");
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.code).toBe(UserManagementErrorCodes.DATABASE_ERROR);
    });
  });

  describe("POST /api/admin/users", () => {
    const validUserData = {
      email: "newuser@example.com",
      first_name: "New",
      last_name: "User",
      password: "password123",
      role_id: "role-1",
      is_active: true,
    };

    beforeEach(() => {
      (bcrypt.hash as any).mockResolvedValue("hashed-password");
      (prisma.user.findUnique as any).mockResolvedValue(null); // No existing user
      (prisma.role.findUnique as any).mockResolvedValue({
        id: "role-1",
        name: "USER",
      });
    });

    it("should create a new user successfully", async () => {
      const createdUser = {
        id: "new-user-id",
        ...validUserData,
        password: "hashed-password",
        created_at: new Date(),
        updated_at: new Date(),
        sex: true,
        birthday: null,
        address: null,
        remember_token: null,
        slack_webhook_url: null,
        deleted_at: null,
        coin: BigInt(1000),
        locale: "en",
        group_id: 1,
        last_login: null,
        last_logout: null,
        avatar: null,
        role: {
          id: "role-1",
          name: "USER",
          permissions: ["read:profile"],
          description: "Regular user",
        },
      };

      (prisma.user.create as any).mockResolvedValue(createdUser);

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(validUserData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.email).toBe(validUserData.email);
      expect(data.user.full_name).toBe("New User");
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
    });

    it("should validate required fields", async () => {
      const invalidData = {
        email: "test@example.com",
        // Missing required fields
      };

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("VALIDATION_ERROR");
      expect(data.details.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "first_name" }),
          expect.objectContaining({ field: "last_name" }),
          expect.objectContaining({ field: "password" }),
        ])
      );
    });

    it("should validate email format", async () => {
      const invalidEmailData = {
        ...validUserData,
        email: "invalid-email",
      };

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(invalidEmailData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("VALIDATION_ERROR");
      expect(data.details.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: "Invalid email format",
          }),
        ])
      );
    });

    it("should validate password length", async () => {
      const shortPasswordData = {
        ...validUserData,
        password: "123",
      };

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(shortPasswordData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("VALIDATION_ERROR");
      expect(data.details.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            message: expect.stringContaining("at least"),
          }),
        ])
      );
    });

    it("should prevent duplicate email addresses", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "existing-user",
      });

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(validUserData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("EMAIL_ALREADY_EXISTS");
    });

    it("should validate role existence", async () => {
      (prisma.role.findUnique as any).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(validUserData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("INVALID_ROLE");
    });

    it("should handle invalid JSON in request body", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: "invalid json",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("VALIDATION_ERROR");
      expect(data.error).toBe("Invalid JSON in request body");
    });

    it("should validate optional fields", async () => {
      const dataWithInvalidBirthday = {
        ...validUserData,
        birthday: "invalid-date",
      };

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(dataWithInvalidBirthday),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("VALIDATION_ERROR");
      expect(data.details.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "birthday",
            message: "Invalid birthday format",
          }),
        ])
      );
    });

    it("should provide password strength warnings", async () => {
      const weakPasswordData = {
        ...validUserData,
        password: "weakpass",
      };

      (prisma.user.create as any).mockResolvedValue({
        id: "new-user-id",
        ...weakPasswordData,
        password: "hashed-password",
        created_at: new Date(),
        updated_at: new Date(),
        sex: true,
        birthday: null,
        address: null,
        remember_token: null,
        slack_webhook_url: null,
        deleted_at: null,
        coin: BigInt(1000),
        locale: "en",
        group_id: 1,
        last_login: null,
        last_logout: null,
        avatar: null,
        role: {
          id: "role-1",
          name: "USER",
          permissions: ["read:profile"],
          description: "Regular user",
        },
      });

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(weakPasswordData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.validation?.warnings).toBeDefined();
      expect(data.validation?.warnings?.length).toBeGreaterThan(0);
    });

    it("should handle database connection errors", async () => {
      (prisma.user.findUnique as any).mockRejectedValue(
        new Error("Connection timeout")
      );

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(validUserData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe(UserManagementErrorCodes.INTERNAL_SERVER_ERROR);
    });

    it("should validate email uniqueness case-insensitively", async () => {
      const upperCaseEmailData = {
        ...validUserData,
        email: "NEWUSER@EXAMPLE.COM",
      };

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "existing-user",
        email: "newuser@example.com",
      });

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(upperCaseEmailData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe(UserManagementErrorCodes.EMAIL_ALREADY_EXISTS);
    });

    it("should handle very long field values", async () => {
      const longFieldData = {
        ...validUserData,
        first_name: "A".repeat(256), // Assuming max length is 255
        address: "B".repeat(1001), // Assuming max length is 1000
      };

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(longFieldData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe(UserManagementErrorCodes.VALIDATION_ERROR);
      expect(data.details.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "first_name" }),
          expect.objectContaining({ field: "address" }),
        ])
      );
    });

    it("should validate birthday is not in the future", async () => {
      const futureBirthdayData = {
        ...validUserData,
        birthday: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      };

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(futureBirthdayData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe(UserManagementErrorCodes.VALIDATION_ERROR);
      expect(data.details.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "birthday",
            message: "Birthday cannot be in the future",
          }),
        ])
      );
    });

    it("should handle special characters in names", async () => {
      const specialCharData = {
        ...validUserData,
        first_name: "José",
        last_name: "García-López",
      };

      const createdUser = {
        id: "new-user-id",
        ...specialCharData,
        password: "hashed-password",
        created_at: new Date(),
        updated_at: new Date(),
        sex: true,
        birthday: null,
        address: null,
        remember_token: null,
        slack_webhook_url: null,
        deleted_at: null,
        coin: BigInt(1000),
        locale: "en",
        group_id: 1,
        last_login: null,
        last_logout: null,
        avatar: null,
        role: {
          id: "role-1",
          name: "USER",
          permissions: ["read:profile"],
          description: "Regular user",
        },
      };

      (prisma.user.create as any).mockResolvedValue(createdUser);

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        body: JSON.stringify(specialCharData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.first_name).toBe("José");
      expect(data.user.last_name).toBe("García-López");
      expect(data.user.full_name).toBe("José García-López");
    });
  });

  describe("POST /api/admin/users/bulk", () => {
    const bulkBanRequest = {
      operation: "ban" as const,
      userIds: ["user-1", "user-2"],
    };

    it("should ban multiple users successfully", async () => {
      (prisma.user.updateMany as any).mockResolvedValue({ count: 2 });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify(bulkBanRequest),
        }
      );

      const response = await BulkPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(2);
      expect(data.failed).toBe(0);
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["user-1", "user-2"] },
        },
        data: { is_active: false },
      });
    });

    it("should prevent admin from banning themselves", async () => {
      const selfBanRequest = {
        operation: "ban" as const,
        userIds: ["admin-user-id"],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify(selfBanRequest),
        }
      );

      const response = await BulkPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("CANNOT_BAN_SELF");
    });

    it("should handle role assignment with validation", async () => {
      const roleAssignRequest = {
        operation: "assign_role" as const,
        userIds: ["user-1", "user-2"],
        roleId: "role-1",
      };

      (prisma.role.findUnique as any).mockResolvedValue({
        id: "role-1",
        name: "USER",
      });
      (prisma.user.updateMany as any).mockResolvedValue({ count: 2 });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify(roleAssignRequest),
        }
      );

      const response = await BulkPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(2);
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: "role-1" },
      });
    });

    it("should validate role existence for role assignment", async () => {
      const invalidRoleRequest = {
        operation: "assign_role" as const,
        userIds: ["user-1"],
        roleId: "invalid-role",
      };

      (prisma.role.findUnique as any).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify(invalidRoleRequest),
        }
      );

      const response = await BulkPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("INVALID_ROLE");
    });

    it("should handle partial failures in bulk delete", async () => {
      const deleteRequest = {
        operation: "delete" as const,
        userIds: ["user-1", "user-2"],
      };

      (prisma.$transaction as any).mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            delete: vi
              .fn()
              .mockResolvedValueOnce(undefined) // user-1 success
              .mockRejectedValueOnce(new Error("Cannot delete")), // user-2 fails
          },
        };
        return callback(mockTx);
      });

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify(deleteRequest),
        }
      );

      const response = await BulkPOST(request);
      const data = await response.json();

      expect(response.status).toBe(207); // Multi-Status
      expect(data.success).toBe(1);
      expect(data.failed).toBe(1);
      expect(data.errors).toHaveLength(1);
    });

    it("should validate bulk operation request format", async () => {
      const invalidRequest = {
        operation: "invalid" as any,
        userIds: [],
      };

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify(invalidRequest),
        }
      );

      const response = await BulkPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("VALIDATION_ERROR");
    });

    it("should check permissions for bulk operations", async () => {
      mockAbility.cannot.mockReturnValue(true);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users/bulk",
        {
          method: "POST",
          body: JSON.stringify(bulkBanRequest),
        }
      );

      const response = await BulkPOST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.code).toBe("INSUFFICIENT_PERMISSIONS");
    });
  });
});
