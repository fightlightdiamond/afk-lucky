import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedRoles } from "./seeders/roleSeeder";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Seed roles first
  await seedRoles();

  // Get admin role
  const adminRole = await prisma.role.findUnique({
    where: { name: UserRole.ADMIN },
  });

  if (!adminRole) {
    throw new Error("Admin role not found. Please run role seeder first.");
  }

  // Tạo tài khoản admin mẫu
  const password = "123456"; // Mật khẩu plaintext
  const hashedPassword = await bcrypt.hash(password, 10); // Hash

  // Kiểm tra user đã tồn tại chưa
  const email = "admin@example.com";
  const existed = await prisma.user.findUnique({ where: { email } });
  if (!existed) {
    // Tạo user mới với admin role
    const user = await prisma.user.create({
      data: {
        first_name: "Admin",
        last_name: "Demo",
        email,
        password: hashedPassword,
        sex: true,
        is_active: true,
        coin: BigInt(1000),
        locale: "vi",
        group_id: 1,
        role_id: adminRole.id,
      },
    });
    console.log("✅ Tạo admin user thành công:", user.email);
  } else {
    // Update existing user to have admin role
    await prisma.user.update({
      where: { email },
      data: { role_id: adminRole.id },
    });
    console.log("✅ User đã tồn tại và được cập nhật admin role:", email);
  }

  console.log("✅ Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
