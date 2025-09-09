'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { hasAnyPermission, hasAllPermissions } from '@/lib/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermissions?: string | string[];
  requireAll?: boolean;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
  redirectTo?: string;
}

export function PermissionGuard({
  children,
  requiredPermissions,
  requireAll = false,
  loadingComponent,
  unauthorizedComponent,
  redirectTo = '/unauthorized',
}: PermissionGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [status, router]);

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // If no session, redirect happens in useEffect
  if (!session) {
    return null;
  }

  // If no permissions required, render children
  if (!requiredPermissions) {
    return <>{children}</>;
  }

  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  // Check permissions
  const hasPermission = requireAll
    ? hasAllPermissions(session.user.role?.name, permissions)
    : hasAnyPermission(session.user.role?.name, permissions);

  // If user has permission, render children
  if (hasPermission) {
    return <>{children}</>;
  }

  // If unauthorized, show unauthorized component or redirect
  if (unauthorizedComponent) {
    return <>{unauthorizedComponent}</>;
  }

  // Redirect to unauthorized page if no component provided
  useEffect(() => {
    router.push(redirectTo);
  }, [router, redirectTo]);

  return null;
}

// Higher Order Component for permission checking
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions?: string | string[],
  requireAll = false
) {
  return function WithPermissionWrapper(props: P) {
    return (
      <PermissionGuard requiredPermissions={requiredPermissions} requireAll={requireAll}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}
