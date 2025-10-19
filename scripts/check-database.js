#!/usr/bin/env node

/**
 * Script kiểm tra trạng thái database và hiển thị thông tin
 * Sử dụng: node scripts/check-database.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log("🔍 Kiểm tra trạng thái database...\n");

  try {
    // Kiểm tra kết nối
    await prisma.$connect();
    console.log("✅ Kết nối database thành công");

    // Kiểm tra các bảng chính
    const tables = [
      { name: "Roles", model: prisma.role },
      { name: "Users", model: prisma.user },
      { name: "Story Templates", model: prisma.storyTemplate },
      { name: "Story Versions", model: prisma.storyVersion },
      { name: "Stories", model: prisma.story },
      { name: "Groups", model: prisma.group },
      { name: "Messages", model: prisma.message },
    ];

    console.log("\n📊 Thống kê dữ liệu:");
    console.log("─".repeat(40));

    for (const table of tables) {
      try {
        const count = await table.model.count();
        console.log(
          `${table.name.padEnd(20)} : ${count.toString().padStart(5)} records`
        );
      } catch (error) {
        console.log(`${table.name.padEnd(20)} : ERROR - ${error.message}`);
      }
    }

    // Hiển thị thông tin users chi tiết
    console.log("\n👥 Thông tin Users:");
    console.log("─".repeat(60));

    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (users.length === 0) {
      console.log("Không có user nào trong database");
    } else {
      console.log(
        "Email".padEnd(25) + "Name".padEnd(20) + "Role".padEnd(12) + "Active"
      );
      console.log("─".repeat(60));

      users.forEach((user) => {
        const email = user.email.padEnd(25);
        const name = `${user.first_name} ${user.last_name}`.padEnd(20);
        const role = (user.role?.name || "No Role").padEnd(12);
        const active = user.is_active ? "✅" : "❌";

        console.log(`${email}${name}${role}${active}`);
      });
    }

    // Hiển thị thông tin roles
    console.log("\n📋 Thông tin Roles:");
    console.log("─".repeat(50));

    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (roles.length === 0) {
      console.log("Không có role nào trong database");
    } else {
      console.log("Role".padEnd(15) + "Users".padEnd(8) + "Permissions");
      console.log("─".repeat(50));

      roles.forEach((role) => {
        const roleName = role.name.padEnd(15);
        const userCount = role._count.users.toString().padStart(5);
        const permCount = role.permissions.length;

        console.log(`${roleName}${userCount}    ${permCount} permissions`);
      });
    }

    // Kiểm tra story templates
    console.log("\n📖 Story Templates:");
    console.log("─".repeat(50));

    const templates = await prisma.storyTemplate.findMany({
      orderBy: { usage_count: "desc" },
    });

    if (templates.length === 0) {
      console.log("Không có template nào");
    } else {
      templates.forEach((template) => {
        const popular = template.popular ? "⭐" : "  ";
        console.log(
          `${popular} ${template.icon} ${template.name} (${template.category})`
        );
      });
    }

    console.log("\n✅ Kiểm tra database hoàn tất!");
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra database:", error.message);

    if (error.code === "P1001") {
      console.log("\n💡 Gợi ý: Database có thể chưa khởi động. Hãy chạy:");
      console.log("   docker-compose up -d db");
    } else if (error.code === "P2021") {
      console.log("\n💡 Gợi ý: Bảng không tồn tại. Hãy chạy migrations:");
      console.log("   npx prisma migrate deploy");
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
checkDatabase();
