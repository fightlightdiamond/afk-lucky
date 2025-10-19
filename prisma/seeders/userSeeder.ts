import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log("🌱 Seeding users...");

  try {
    // Lấy tất cả roles
    const roles = await prisma.role.findMany();
    const roleMap = new Map(roles.map((role) => [role.name, role.id]));

    // Dữ liệu users mẫu
    const sampleUsers = [
      {
        first_name: "Admin",
        last_name: "System",
        email: "admin@example.com",
        password: "123456",
        role: UserRole.ADMIN,
        sex: true,
        is_active: true,
        coin: BigInt(10000),
        locale: "vi",
      },
      {
        first_name: "Nguyễn",
        last_name: "Văn A",
        email: "editor@example.com",
        password: "123456",
        role: UserRole.EDITOR,
        sex: true,
        is_active: true,
        coin: BigInt(5000),
        locale: "vi",
      },
      {
        first_name: "Trần",
        last_name: "Thị B",
        email: "author@example.com",
        password: "123456",
        role: UserRole.AUTHOR,
        sex: false,
        is_active: true,
        coin: BigInt(3000),
        locale: "vi",
      },
      {
        first_name: "Lê",
        last_name: "Văn C",
        email: "moderator@example.com",
        password: "123456",
        role: UserRole.MODERATOR,
        sex: true,
        is_active: true,
        coin: BigInt(2000),
        locale: "vi",
      },
      {
        first_name: "Phạm",
        last_name: "Thị D",
        email: "user@example.com",
        password: "123456",
        role: UserRole.USER,
        sex: false,
        is_active: true,
        coin: BigInt(1000),
        locale: "vi",
      },
      // Thêm một số users không hoạt động
      {
        first_name: "Hoàng",
        last_name: "Văn E",
        email: "inactive@example.com",
        password: "123456",
        role: UserRole.USER,
        sex: true,
        is_active: false,
        coin: BigInt(500),
        locale: "en",
      },
    ];

    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const roleId = roleMap.get(userData.role);

      if (!roleId) {
        console.warn(
          `⚠️  Role ${userData.role} not found, skipping user ${userData.email}`
        );
        continue;
      }

      // Kiểm tra user đã tồn tại chưa
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        // Cập nhật user hiện có
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            password: hashedPassword,
            role_id: roleId,
            sex: userData.sex,
            is_active: userData.is_active,
            coin: userData.coin,
            locale: userData.locale,
          },
        });
        console.log(`✅ Updated user: ${userData.email} (${userData.role})`);
      } else {
        // Tạo user mới
        await prisma.user.create({
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: hashedPassword,
            role_id: roleId,
            sex: userData.sex,
            is_active: userData.is_active,
            coin: userData.coin,
            locale: userData.locale,
          },
        });
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      }
    }

    console.log("✅ Users seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedUsers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
