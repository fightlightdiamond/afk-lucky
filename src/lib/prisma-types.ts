// Enhanced Prisma types with proper library usage
import { 
  User as PrismaUser, 
  Role as PrismaRole, 
  UserRole,
  Prisma 
} from "@prisma/client";

// Re-export Prisma types
export { UserRole, Prisma } from "@prisma/client";
export type { User, Role } from "@prisma/client";

// Enhanced User type with computed fields
export type UserWithRole = PrismaUser & {
  role: PrismaRole | null;
};

// User select type for API responses
export const userSelectFields = {
  id: true,
  email: true,
  first_name: true,
  last_name: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  last_login: true,
  last_logout: true,
  avatar: true,
  sex: true,
  birthday: true,
  address: true,
  deleted_at: true,
  coin: true,
  locale: true,
  group_id: true,
  role_id: true,
  slack_webhook_url: true,
  role: {
    select: {
      id: true,
      name: true,
      permissions: true,
      description: true,
    },
  },
} satisfies Prisma.UserSelect;

// Role select type for API responses
export const roleSelectFields = {
  id: true,
  name: true,
  description: true,
  permissions: true,
  created_at: true,
  updated_at: true,
  _count: {
    select: {
      users: true,
    },
  },
} satisfies Prisma.RoleSelect;

// Type for user with selected fields
export type UserWithRoleSelect = Prisma.UserGetPayload<{
  select: typeof userSelectFields;
}>;

// Type for role with count
export type RoleWithCount = Prisma.RoleGetPayload<{
  select: typeof roleSelectFields;
}>;

// Transform function for API responses
export function transformUserForAPI(user: UserWithRoleSelect) {
  const age = user.birthday
    ? Math.floor(
        (Date.now() - new Date(user.birthday).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : undefined;

  let activity_status: "online" | "offline" | "never" = "never";
  if (user.last_login) {
    const lastLoginTime = new Date(user.last_login).getTime();
    const timeDiff = Date.now() - lastLoginTime;
    activity_status = timeDiff < 5 * 60 * 1000 ? "online" : "offline";
  }

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    is_active: user.is_active,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
    last_login: user.last_login?.toISOString(),
    last_logout: user.last_logout?.toISOString(),
    avatar: user.avatar,
    sex: user.sex,
    birthday: user.birthday?.toISOString(),
    address: user.address,
    deleted_at: user.deleted_at?.toISOString(),
    coin: user.coin?.toString(),
    locale: user.locale,
    group_id: user.group_id,
    role_id: user.role_id,
    role: user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.permissions || [],
          description: user.role.description,
        }
      : undefined,
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    display_name: `${user.first_name} ${user.last_name}`.trim(),
    status: user.is_active ? "active" as const : "inactive" as const,
    activity_status,
    age,
  };
}

// Order by helper using Prisma types
export function createOrderBy(
  sortBy?: string,
  sortOrder?: string
): Prisma.UserOrderByWithRelationInput[] {
  const order = sortOrder === "asc" ? Prisma.SortOrder.asc : Prisma.SortOrder.desc;

  switch (sortBy) {
    case "full_name":
      return [{ first_name: order }, { last_name: order }];
    case "email":
      return [{ email: order }];
    case "last_login":
      return [{ last_login: order }];
    case "role":
      return [
        { role: { name: order } },
        { first_name: Prisma.SortOrder.asc },
      ];
    case "status":
      return [
        { is_active: order },
        { first_name: Prisma.SortOrder.asc },
      ];
    case "activity_status":
      return [{ last_login: order }, { first_name: Prisma.SortOrder.asc }];
    case "created_at":
    default:
      return [{ created_at: order }];
  }
}
