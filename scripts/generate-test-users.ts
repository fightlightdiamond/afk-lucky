import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const ROLES = ["admin", "moderator", "user", "editor", "viewer"];
const LOCALES = ["en", "vi", "ja", "ko", "zh", "fr", "de", "es"];
const ACTIVITY_STATUSES = ["online", "offline", "never"];

async function generateTestUsers(count: number = 5000) {
  console.log(`Generating ${count} test users...`);

  // Get existing roles
  const existingRoles = await prisma.role.findMany();
  const roleIds = existingRoles.map((role) => role.id);

  const users = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    // Random dates for variety
    const createdAt = faker.date.between({
      from: new Date("2020-01-01"),
      to: new Date(),
    });

    const lastLoginAt =
      Math.random() > 0.3
        ? faker.date.between({ from: createdAt, to: new Date() })
        : null; // 30% never logged in

    const user = {
      email,
      first_name: firstName,
      last_name: lastName,
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      role_id: faker.helpers.arrayElement(roleIds),
      is_active: Math.random() > 0.1, // 90% active
      avatar: Math.random() > 0.4 ? faker.image.avatar() : null, // 60% have avatar
      locale: faker.helpers.arrayElement(LOCALES),
      group_id:
        Math.random() > 0.7 ? faker.number.int({ min: 1, max: 10 }) : null, // 30% in groups
      created_at: createdAt,
      updated_at: faker.date.between({ from: createdAt, to: new Date() }),
      last_login: lastLoginAt,
    };

    users.push(user);

    // Batch insert every 100 users to avoid memory issues
    if (users.length === 100) {
      await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
      });
      users.length = 0; // Clear array
      console.log(`Created ${i + 1} users...`);
    }
  }

  // Insert remaining users
  if (users.length > 0) {
    await prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    });
  }

  console.log(`✅ Successfully generated ${count} test users!`);
}

async function main() {
  try {
    const count = process.argv[2] ? parseInt(process.argv[2]) : 5000;
    await generateTestUsers(count);
  } catch (error) {
    console.error("Error generating test users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
