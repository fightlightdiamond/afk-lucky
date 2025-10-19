import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedGroups() {
  console.log("🌱 Seeding groups...");

  try {
    // Tạo group mặc định trước
    const defaultGroup = await prisma.group.upsert({
      where: { id: 1 },
      update: {
        name: "Default Group",
      },
      create: {
        id: 1,
        name: "Default Group",
        ownerId: "temp-owner", // Sẽ được cập nhật sau khi tạo admin user
      },
    });

    console.log(`✅ Default group created: ${defaultGroup.name}`);
    console.log("✅ Groups seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding groups:", error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedGroups()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
