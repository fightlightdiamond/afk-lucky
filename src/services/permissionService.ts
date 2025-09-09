import { UserRole } from "@prisma/client";

// Define all available permissions in the system
export const AVAILABLE_PERMISSIONS = [
  // User management
  "user:read",
  "user:create",
  "user:update",
  "user:delete",

  // Role management
  "role:read",
  "role:create",
  "role:update",
  "role:delete",

  // Permission management
  "permission:manage",

  // Content management
  "content:create",
  "content:read",
  "content:update",
  "content:delete",
  "content:publish",

  // Story management
  "story:create",
  "story:read",
  "story:update",
  "story:delete",
  "story:publish",

  // Analytics
  "analytics:read",
  "analytics:export",

  // Settings
  "settings:read",
  "settings:update",

  // System administration
  "system:backup",
  "system:restore",
  "system:maintenance",
] as const;

export type Permission = (typeof AVAILABLE_PERMISSIONS)[number];

// Default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    ...AVAILABLE_PERMISSIONS,
  ],
  [UserRole.EDITOR]: [
    "user:read",
    "content:create",
    "content:read",
    "content:update",
    "content:delete",
    "content:publish",
    "story:create",
    "story:read",
    "story:update",
    "story:delete",
    "story:publish",
    "analytics:read",
  ],
  [UserRole.AUTHOR]: [
    "content:create",
    "content:read",
    "content:update",
    "story:create",
    "story:read",
    "story:update",
  ],
  [UserRole.MODERATOR]: [
    "user:read",
    "content:read",
    "content:update",
    "content:delete",
    "story:read",
    "story:update",
    "story:delete",
    "analytics:read",
  ],
  [UserRole.USER]: ["content:read", "story:create", "story:read"],
};

// Permission categories for better organization
export const PERMISSION_CATEGORIES = {
  "User Management": ["user:read", "user:create", "user:update", "user:delete"],
  "Role Management": [
    "role:read",
    "role:create",
    "role:update",
    "role:delete",
    "permission:manage",
  ],
  "Content Management": [
    "content:create",
    "content:read",
    "content:update",
    "content:delete",
    "content:publish",
  ],
  "Story Management": [
    "story:create",
    "story:read",
    "story:update",
    "story:delete",
    "story:publish",
  ],
  Analytics: ["analytics:read", "analytics:export"],
  Settings: ["settings:read", "settings:update"],
  System: ["system:backup", "system:restore", "system:maintenance"],
} as const;

// Helper functions
export function hasPermission(
  userPermissions: string[],
  permission: Permission
): boolean {
  return userPermissions.includes(permission);
}

export function hasAnyPermission(
  userPermissions: string[],
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => userPermissions.includes(permission));
}

export function hasAllPermissions(
  userPermissions: string[],
  permissions: Permission[]
): boolean {
  return permissions.every((permission) =>
    userPermissions.includes(permission)
  );
}

export function getPermissionsByCategory(
  category: keyof typeof PERMISSION_CATEGORIES
): Permission[] {
  return PERMISSION_CATEGORIES[category] as Permission[];
}

export function getCategoryForPermission(
  permission: Permission
): string | null {
  for (const [category, permissions] of Object.entries(PERMISSION_CATEGORIES)) {
    if (permissions.includes(permission as any)) {
      return category;
    }
  }
  return null;
}

export function validatePermissions(permissions: string[]): {
  valid: Permission[];
  invalid: string[];
} {
  const valid: Permission[] = [];
  const invalid: string[] = [];

  permissions.forEach((permission) => {
    if (AVAILABLE_PERMISSIONS.includes(permission as Permission)) {
      valid.push(permission as Permission);
    } else {
      invalid.push(permission);
    }
  });

  return { valid, invalid };
}
