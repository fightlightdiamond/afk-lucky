import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  // Tạo tài khoản admin mẫu
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Kiểm tra user đã tồn tại chưa
  const email = "admin@example.com";
  const existed = await prisma.user.findUnique({ where: { email } });
  if (!existed) {
    // Tạo user mới
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
      },
    });
    console.log("✅ Tạo user thành công:", user.email);
  } else {
    console.log("✅ User đã tồn tại:", email);
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
