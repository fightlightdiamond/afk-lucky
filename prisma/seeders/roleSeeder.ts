import { PrismaClient, UserRole } from "@prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "../../src/services/permissionService";

const prisma = new PrismaClient();

export async function seedRoles() {
  console.log("🌱 Seeding roles...");

  try {
    // Create or update roles with their default permissions
    for (const [roleName, permissions] of Object.entries(
      DEFAULT_ROLE_PERMISSIONS
    )) {
      const role = await prisma.role.upsert({
        where: { name: roleName as UserRole },
        update: {
          permissions: {
            set: permissions,
          },
        },
        create: {
          name: roleName as UserRole,
          description: getRoleDescription(roleName as UserRole),
          permissions: {
            set: permissions,
          },
        },
      });

      console.log(
        `✅ Role ${roleName} created/updated with ${permissions.length} permissions`
      );
    }

    console.log("✅ Roles seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
    throw error;
  }
}

function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Full system administrator with all permissions",
    [UserRole.EDITOR]: "Content editor with publishing capabilities",
    [UserRole.AUTHOR]: "Content creator with basic editing permissions",
    [UserRole.MODERATOR]:
      "Content moderator with review and management permissions",
    [UserRole.USER]: "Basic user with limited content creation permissions",
  };

  return descriptions[role] || "Standard user role";
}

// Run seeder if called directly
if (require.main === module) {
  seedRoles()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
