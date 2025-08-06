import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedUsers() {
  const password = await bcrypt.hash("123456", 10);

  const users = [
    {
      first_name: "Admin",
      last_name: "Demo",
      email: "admin@example.com",
      password,
      sex: true,
      is_active: true,
      coin: BigInt(1000),
      locale: "vi",
      group_id: 1,
    },
    // Thêm user khác nếu muốn
  ];

  for (const data of users) {
    const existed = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!existed) {
      await prisma.user.create({ data });
      console.log("Tạo user thành công:", data.email);
    } else {
      console.log("User đã tồn tại:", data.email);
    }
  }
}
