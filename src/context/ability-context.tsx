'use client';

import { createContext, useContext, useEffect } from 'react';
import { Ability, AbilityBuilder, createMongoAbility } from '@casl/ability';

// Define ability types
type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subject = 'all' | 'User' | 'Role' | 'Permission' | 'Content' | 'Settings';

type AppAbility = Ability<[Action, Subject]>;

// Create context with default ability
export const AbilityContext = createContext<AppAbility | undefined>(undefined);

// Custom hook to use ability
export const useAbility = () => {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error('useAbility must be used within an AbilityProvider');
  }
  return ability;
};

// Provider component
export function AbilityProvider({ children, user }: { children: React.ReactNode; user?: any }) {
  const ability = createMongoAbility<AppAbility>();
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);

  useEffect(() => {
    if (user) {
      // Admin has all permissions
      if (user.role?.name === 'ADMIN') {
        can('manage', 'all');
      } else {
        // Define permissions based on user role
        const permissions = user.role?.permissions || [];
        
        // Parse permissions and define abilities
        permissions.forEach((permission: string) => {
          const [resource, action] = permission.split(':');
          
          // Map resource to subject
          let subject: Subject = 'all';
          switch (resource) {
            case 'user':
              subject = 'User';
              break;
            case 'role':
              subject = 'Role';
              break;
            case 'permission':
              subject = 'Permission';
              break;
            case 'content':
              subject = 'Content';
              break;
            case 'settings':
              subject = 'Settings';
              break;
          }
          
          // Map action to CASL action
          switch (action) {
            case 'manage':
              can('manage', subject);
              break;
            case 'create':
              can('create', subject);
              break;
            case 'read':
              can('read', subject);
              break;
            case 'update':
              can('update', subject);
              break;
            case 'delete':
              can('delete', subject);
              break;
          }
        });
      }
    }
    
    // Update ability with new rules
    ability.update(rules);
  }, [user]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}
