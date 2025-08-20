import { UserRole } from '@prisma/client';

type Permission = string;
type Permissions = Permission[];

// Define all available permissions
export const PERMISSIONS = {
  // User permissions
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Role permissions
  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  
  // Permission management
  PERMISSION_MANAGE: 'permission:manage',
  
  // Content permissions
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT: 'content:edit',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_DELETE: 'content:delete',
  
  // Settings
  SETTINGS_MANAGE: 'settings:manage',
} as const;

// Default permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  [UserRole.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.PERMISSION_MANAGE,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.SETTINGS_MANAGE,
  ],
  [UserRole.EDITOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.CONTENT_DELETE,
  ],
  [UserRole.AUTHOR]: [
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
  ],
  [UserRole.MODERATOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.CONTENT_DELETE,
  ],
  [UserRole.USER]: [
    PERMISSIONS.CONTENT_CREATE,
  ],
};

// Check if user has a specific permission
export function hasPermission(
  userRole: UserRole | null | undefined,
  permission: Permission
): boolean {
  if (!userRole) return false;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission) || rolePermissions.includes('admin:*');
}

// Check if user has any of the specified permissions
export function hasAnyPermission(
  userRole: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!userRole) return false;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return (
    rolePermissions.includes('admin:*') ||
    permissions.some(permission => rolePermissions.includes(permission))
  );
}

// Check if user has all of the specified permissions
export function hasAllPermissions(
  userRole: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!userRole) return false;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return (
    rolePermissions.includes('admin:*') ||
    permissions.every(permission => rolePermissions.includes(permission))
  );
}
