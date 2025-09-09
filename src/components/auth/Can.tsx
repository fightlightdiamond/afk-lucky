'use client';

import { ReactNode } from 'react';
import { useAbility } from '@/hooks/useAbility';

type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subject = 'all' | 'User' | 'Story' | 'Profile' | 'Contact';

// Export action constants for easier usage
export const Action = {
  Manage: 'manage' as const,
  Create: 'create' as const,
  Read: 'read' as const,
  Update: 'update' as const,
  Delete: 'delete' as const
};

export const Subject = {
  All: 'all' as const,
  User: 'User' as const,
  Story: 'Story' as const,
  Profile: 'Profile' as const,
  Contact: 'Contact' as const
};

interface CanProps {
  I: Action | Action[];
  a: Subject | Subject[];
  children: ReactNode;
  passThrough?: boolean;
  field?: string;
  where?: Record<string, unknown>;
}

export const Can = ({ I, a, children, passThrough = false, field, where }: CanProps) => {
  const ability = useAbility();
  const actions = Array.isArray(I) ? I : [I];
  const subjects = Array.isArray(a) ? a : [a];

  const canPerformAction = subjects.some(subject => {
    return actions.some(action => {
      // Handle field-level permissions
      if (field) {
        return ability.can(action, subject, field);
      }
      
      // Handle object-level permissions with conditions
      if (where) {
        // For now, we'll just check if the action is allowed on the subject
        // More complex condition checking can be added here if needed
        return ability.can(action, subject);
      }
      
      // Simple permission check without conditions
      return ability.can(action, subject);
    });
  });

  if (canPerformAction || passThrough) {
    return <>{children}</>;
  }

  return null;
};

// Helper components for common permission checks
type CanActionProps = Omit<CanProps, 'I'>;

export const CanCreate = (props: CanActionProps) => (
  <Can I={Action.Create} {...props} />
);

export const CanRead = (props: CanActionProps) => (
  <Can I={Action.Read} {...props} />
);

export const CanUpdate = (props: CanActionProps) => (
  <Can I={Action.Update} {...props} />
);

export const CanDelete = (props: CanActionProps) => (
  <Can I={Action.Delete} {...props} />
);

export const CanManage = (props: CanActionProps) => (
  <Can I={Action.Manage} {...props} />
);
