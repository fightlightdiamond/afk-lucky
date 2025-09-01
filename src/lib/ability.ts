import { createMongoAbility, AbilityBuilder, MongoAbility } from "@casl/ability";
import { Session } from "next-auth";
import { UserRole } from "@prisma/client";

export type Actions = "manage" | "create" | "read" | "update" | "delete" | "publish";

export type Subjects = 
  | "User"
  | "Role"  
  | "Story"
  | "Profile"
  | "Contact"
  | "Permission"
  | "Content"
  | "Settings"
  | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilitiesFor(session: Session | null) {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Guest permissions
  if (!session?.user) {
    can("read", "Story"); // Allow guests to read stories
    return build();
  }

  const userRole = session.user.role?.name;
  const userPermissions = session.user.role?.permissions || [];

  // Admin has all permissions
  if (userRole === UserRole.ADMIN) {
    can("manage", "all");
    return build();
  }

  // Default permissions for all authenticated users
  can("read", "Profile");
  can("update", "Profile");

  // Map permissions to CASL abilities
  userPermissions.forEach((permission) => {

    switch (permission) {
      // User permissions
      case "user:read":
        can("read", "User");
        break;
      case "user:create":
        can("create", "User");
        break;
      case "user:update":
        can("update", "User");
        break;
      case "user:delete":
        can("delete", "User");
        break;

      // Role permissions
      case "role:read":
        can("read", "Role");
        break;
      case "role:create":
        can("create", "Role");
        break;
      case "role:update":
        can("update", "Role");
        break;
      case "role:delete":
        can("delete", "Role");
        break;

      // Story permissions
      case "story:read":
        can("read", "Story");
        break;
      case "story:create":
        can("create", "Story");
        break;
      case "story:update":
        can("update", "Story");
        break;
      case "story:delete":
        can("delete", "Story");
        break;
      case "story:publish":
        can("publish", "Story");
        break;

      // Content permissions
      case "content:read":
        can("read", "Story"); // Map content to Story for now
        break;
      case "content:create":
        can("create", "Story");
        break;
      case "content:update":
        can("update", "Story");
        break;
      case "content:delete":
        can("delete", "Story");
        break;
      case "content:publish":
        can("publish", "Story");
        break;

      // Contact permissions
      case "contact:create":
        can("create", "Contact");
        break;
      case "contact:read":
        can("read", "Contact");
        break;
      case "contact:update":
        can("update", "Contact");
        break;
      case "contact:delete":
        can("delete", "Contact");
        break;
    }
  });

  // Fallback: if user has any story-related permission, allow reading stories
  if (
    userPermissions.some(
      (p) => p.startsWith("story:") || p.startsWith("content:")
    )
  ) {
    can("read", "Story");
  }

  return build();
}

export const createAbility = (session: Session | null = null) => {
  return defineAbilitiesFor(session);
};
