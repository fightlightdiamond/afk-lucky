import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log("🔍 Checking admin user...");

    // Check user
    const user = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
      include: {
        role: true,
      },
    });

    console.log(
      "👤 User data:",
      JSON.stringify(
        user,
        (key, value) => (typeof value === "bigint" ? value.toString() : value),
        2
      )
    );

    // Check all roles
    console.log("\n🎭 All roles:");
    const roles = await prisma.role.findMany();
    console.log(
      JSON.stringify(
        roles,
        (key, value) => (typeof value === "bigint" ? value.toString() : value),
        2
      )
    );

    // Check if user has correct role_id
    if (user && user.role_id) {
      const role = await prisma.role.findUnique({
        where: { id: user.role_id },
      });
      console.log(
        "\n🔗 User role:",
        JSON.stringify(
          role,
          (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          2
        )
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
