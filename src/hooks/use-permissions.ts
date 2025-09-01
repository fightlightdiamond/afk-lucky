import { useSession } from 'next-auth/react';
import { useAbility } from '@/context/AbilityContext';
import { Actions, Subjects } from '@/lib/ability';

type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';
type PermissionResource = 'User' | 'Role' | 'Permission' | 'Content' | 'Settings';

export function usePermissions() {
  const { data: session } = useSession();
  const ability = useAbility();

  const hasPermission = (action: PermissionAction, resource: PermissionResource) => {
    if (!session?.user) return false;
    
    // Admin has all permissions
    if (session.user.role?.name === 'ADMIN') return true;
    
    // Check specific permission
    const permission = `${resource}:${action}`;
    return session.user.role?.permissions?.includes(permission) || false;
  };

  const canCreate = (resource: PermissionResource) => hasPermission('create', resource);
  const canRead = (resource: PermissionResource) => hasPermission('read', resource);
  const canUpdate = (resource: PermissionResource) => hasPermission('update', resource);
  const canDelete = (resource: PermissionResource) => hasPermission('delete', resource);
  const canManage = (resource: PermissionResource) => hasPermission('manage', resource);

  // Check if user can perform action on a specific resource instance
  const can = (action: Actions, subject: Subjects, field?: string) => {
    if (!ability) return false;
    return ability.can(action, subject, field);
  };

  // Check if user cannot perform action (useful for guards)
  const cannot = (action: Actions, subject: Subjects, field?: string) => {
    if (!ability) return true;
    return ability.cannot(action, subject, field);
  };

  return {
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManage,
    can,
    cannot,
    ability,
  };
}
