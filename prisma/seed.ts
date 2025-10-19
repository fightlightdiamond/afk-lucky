import { PrismaClient } from "@prisma/client";
import { seedRoles } from "./seeders/roleSeeder";
import { seedUsers } from "./seeders/userSeeder";
import { seedGroups } from "./seeders/groupSeeder";
import { seedStoryTemplates, seedStoryVersions } from "./seeders/storySeeder";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seeding...");

  try {
    // 1. Seed roles first (required for users)
    console.log("\n📋 Seeding roles...");
    await seedRoles();

    // 2. Seed groups with temporary owner
    console.log("\n🏢 Seeding groups...");
    await seedGroups();

    // 3. Seed users (depends on roles)
    console.log("\n👥 Seeding users...");
    await seedUsers();

    // 4. Update group owner to admin user
    console.log("\n🔄 Updating group ownership...");
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (adminUser) {
      await prisma.group.update({
        where: { id: 1 },
        data: { ownerId: adminUser.id },
      });

      // Assign all users to default group
      await prisma.user.updateMany({
        data: { group_id: 1 },
      });

      console.log(
        "✅ Group ownership updated and users assigned to default group"
      );
    }

    // 5. Seed story templates
    console.log("\n📖 Seeding story templates...");
    await seedStoryTemplates();

    // 6. Seed story versions
    console.log("\n🎯 Seeding story versions...");
    await seedStoryVersions();

    // 7. Display summary
    console.log("\n📊 Seeding Summary:");

    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const groupCount = await prisma.group.count();
    const templateCount = await prisma.storyTemplate.count();
    const versionCount = await prisma.storyVersion.count();

    console.log(`   - Roles: ${roleCount}`);
    console.log(`   - Groups: ${groupCount}`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Story Templates: ${templateCount}`);
    console.log(`   - Story Versions: ${versionCount}`);

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📋 Sample Login Credentials:");
    console.log("   Admin: admin@example.com / 123456");
    console.log("   Editor: editor@example.com / 123456");
    console.log("   Author: author@example.com / 123456");
    console.log("   Moderator: moderator@example.com / 123456");
    console.log("   User: user@example.com / 123456");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
