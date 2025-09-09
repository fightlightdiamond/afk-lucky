import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function analyzeFields() {
  try {
    console.log("🔍 Analyzing database fields...\n");

    // 1. Check roles with user count
    console.log("📊 Roles with user count:");
    const rolesWithCount = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: { users: true },
        },
      },
    });

    rolesWithCount.forEach((role) => {
      console.log(`- ${role.name}: ${role._count.users} users`);
    });

    // 2. Check users with their roles and group_id
    console.log("\n👥 Users with roles and group_id:");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        group_id: true,
        role_id: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    users.forEach((user) => {
      console.log(
        `- ${user.email}: role=${user.role?.name || "None"}, group_id=${
          user.group_id
        }`
      );
    });

    // 3. Check if there are any groups table or related data
    console.log("\n🏢 Group analysis:");
    const groupStats = await prisma.user.groupBy({
      by: ["group_id"],
      _count: {
        group_id: true,
      },
    });

    groupStats.forEach((stat) => {
      console.log(`- Group ${stat.group_id}: ${stat._count.group_id} users`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeFields();
