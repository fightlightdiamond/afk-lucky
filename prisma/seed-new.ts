import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seeding...");

  try {
    // BƯỚC 1: Seed roles trước (không phụ thuộc gì)
    console.log("\n📋 Step 1: Seeding roles...");
    await seedRoles();

    // BƯỚC 2: Tạo admin user KHÔNG có group_id (để tránh circular dependency)
    console.log("\n👤 Step 2: Creating admin user without group...");
    const adminUser = await createAdminUser();

    // BƯỚC 3: Tạo default group với admin làm owner
    console.log("\n🏢 Step 3: Creating default group...");
    const defaultGroup = await createDefaultGroup(adminUser.id);

    // BƯỚC 4: Cập nhật admin user với group_id
    console.log("\n🔄 Step 4: Updating admin user with group...");
    await updateAdminUserGroup(adminUser.id, defaultGroup.id);

    // BƯỚC 5: Tạo các users khác với group_id đã có
    console.log("\n👥 Step 5: Creating other users...");
    await createOtherUsers(defaultGroup.id);

    // BƯỚC 6: Seed story data
    console.log("\n📖 Step 6: Seeding story templates...");
    await seedStoryTemplates();

    console.log("\n🎯 Step 7: Seeding story versions...");
    await seedStoryVersions();

    // BƯỚC 7: Hiển thị summary
    await displaySummary();

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

// ===== HELPER FUNCTIONS =====

async function seedRoles() {
  const DEFAULT_ROLE_PERMISSIONS = {
    [UserRole.ADMIN]: [
      "users.create",
      "users.read",
      "users.update",
      "users.delete",
      "roles.create",
      "roles.read",
      "roles.update",
      "roles.delete",
      "stories.create",
      "stories.read",
      "stories.update",
      "stories.delete",
      "templates.create",
      "templates.read",
      "templates.update",
      "templates.delete",
      "analytics.read",
      "system.manage",
    ],
    [UserRole.EDITOR]: [
      "stories.create",
      "stories.read",
      "stories.update",
      "stories.delete",
      "templates.read",
      "templates.update",
      "users.read",
    ],
    [UserRole.AUTHOR]: [
      "stories.create",
      "stories.read",
      "stories.update",
      "templates.read",
    ],
    [UserRole.MODERATOR]: [
      "stories.read",
      "stories.update",
      "stories.delete",
      "users.read",
      "templates.read",
    ],
    [UserRole.USER]: ["stories.create", "stories.read", "templates.read"],
  };

  for (const [roleName, permissions] of Object.entries(
    DEFAULT_ROLE_PERMISSIONS
  )) {
    const role = await prisma.role.upsert({
      where: { name: roleName as UserRole },
      update: {
        permissions: {
          set: permissions,
        },
      },
      create: {
        name: roleName as UserRole,
        description: getRoleDescription(roleName as UserRole),
        permissions: {
          set: permissions,
        },
      },
    });

    console.log(
      `✅ Role ${roleName} created/updated with ${permissions.length} permissions`
    );
  }
}

function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Full system administrator with all permissions",
    [UserRole.EDITOR]: "Content editor with publishing capabilities",
    [UserRole.AUTHOR]: "Content creator with basic editing permissions",
    [UserRole.MODERATOR]:
      "Content moderator with review and management permissions",
    [UserRole.USER]: "Basic user with limited content creation permissions",
  };
  return descriptions[role] || "Standard user role";
}

async function createAdminUser() {
  const adminRole = await prisma.role.findUnique({
    where: { name: UserRole.ADMIN },
  });

  if (!adminRole) {
    throw new Error("Admin role not found");
  }

  const hashedPassword = await bcrypt.hash("123456", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      first_name: "Admin",
      last_name: "System",
      password: hashedPassword,
      role_id: adminRole.id,
      is_active: true,
      coin: BigInt(10000),
      locale: "vi",
      // Không set group_id ở đây
    },
    create: {
      first_name: "Admin",
      last_name: "System",
      email: "admin@example.com",
      password: hashedPassword,
      role_id: adminRole.id,
      sex: true,
      is_active: true,
      coin: BigInt(10000),
      locale: "vi",
      // Không set group_id ở đây
    },
  });

  console.log(`✅ Admin user created: ${adminUser.email}`);
  return adminUser;
}

async function createDefaultGroup(adminUserId: string) {
  const defaultGroup = await prisma.group.upsert({
    where: { id: 1 },
    update: {
      name: "Default Group",
      ownerId: adminUserId,
    },
    create: {
      id: 1,
      name: "Default Group",
      ownerId: adminUserId,
    },
  });

  console.log(
    `✅ Default group created: ${defaultGroup.name} (Owner: ${adminUserId})`
  );
  return defaultGroup;
}

async function updateAdminUserGroup(adminUserId: string, groupId: number) {
  await prisma.user.update({
    where: { id: adminUserId },
    data: { group_id: groupId },
  });

  console.log(`✅ Admin user updated with group_id: ${groupId}`);
}

async function createOtherUsers(groupId: number) {
  const roles = await prisma.role.findMany();
  const roleMap = new Map(roles.map((role) => [role.name, role.id]));

  const sampleUsers = [
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

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: hashedPassword,
        role_id: roleId,
        sex: userData.sex,
        is_active: userData.is_active,
        coin: userData.coin,
        locale: userData.locale,
        group_id: groupId,
      },
      create: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: hashedPassword,
        role_id: roleId,
        sex: userData.sex,
        is_active: userData.is_active,
        coin: userData.coin,
        locale: userData.locale,
        group_id: groupId,
      },
    });

    console.log(
      `✅ User created/updated: ${userData.email} (${userData.role})`
    );
  }
}

async function seedStoryTemplates() {
  const templates = [
    {
      name: "Câu chuyện công nghệ",
      description: "Tạo câu chuyện về công nghệ và đổi mới",
      icon: "💻",
      category: "tech",
      config: {
        tone: "professional",
        style: "informative",
        target_audience: "tech_enthusiasts",
      },
      popular: true,
    },
    {
      name: "Câu chuyện kinh doanh",
      description: "Câu chuyện về khởi nghiệp và kinh doanh",
      icon: "💼",
      category: "business",
      config: {
        tone: "motivational",
        style: "narrative",
        target_audience: "entrepreneurs",
      },
      popular: true,
    },
    {
      name: "Câu chuyện cuộc sống",
      description: "Những câu chuyện về cuộc sống hàng ngày",
      icon: "🌟",
      category: "life",
      config: {
        tone: "casual",
        style: "personal",
        target_audience: "general",
      },
      popular: false,
    },
    {
      name: "Câu chuyện giáo dục",
      description: "Câu chuyện mang tính giáo dục và học tập",
      icon: "📚",
      category: "education",
      config: {
        tone: "educational",
        style: "structured",
        target_audience: "students",
      },
      popular: true,
    },
  ];

  for (const template of templates) {
    // Kiểm tra xem template đã tồn tại chưa
    const existing = await prisma.storyTemplate.findFirst({
      where: { name: template.name },
    });

    if (existing) {
      await prisma.storyTemplate.update({
        where: { id: existing.id },
        data: template,
      });
      console.log(`✅ Template updated: ${template.name}`);
    } else {
      await prisma.storyTemplate.create({
        data: template,
      });
      console.log(`✅ Template created: ${template.name}`);
    }
  }
}

async function seedStoryVersions() {
  const versions = [
    {
      name: "Simple",
      slug: "simple",
      description: "Phiên bản cơ bản với các tính năng thiết yếu",
      icon: "🌱",
      color_scheme: "blue",
      features: [
        { name: "Tạo câu chuyện cơ bản", available: true },
        { name: "3 template miễn phí", available: true },
        { name: "Xuất PDF", available: true },
      ],
      limitations: [
        { name: "Tối đa 5 câu chuyện/ngày", limit: 5 },
        { name: "Tối đa 500 từ/câu chuyện", limit: 500 },
      ],
      is_free: true,
      max_stories_per_day: 5,
      max_word_count: 500,
      available_templates: [],
      available_languages: ["vi", "en"],
      advanced_features: {
        custom_templates: false,
        advanced_export: false,
        analytics: false,
      },
    },
    {
      name: "Advanced",
      slug: "advanced",
      description: "Phiên bản nâng cao với nhiều tính năng hơn",
      icon: "🚀",
      color_scheme: "purple",
      features: [
        { name: "Tạo câu chuyện nâng cao", available: true },
        { name: "Tất cả templates", available: true },
        { name: "Xuất đa định dạng", available: true },
        { name: "Phân tích chi tiết", available: true },
      ],
      limitations: [
        { name: "Tối đa 20 câu chuyện/ngày", limit: 20 },
        { name: "Tối đa 2000 từ/câu chuyện", limit: 2000 },
      ],
      is_free: false,
      price_monthly: 99000,
      price_yearly: 990000,
      max_stories_per_day: 20,
      max_word_count: 2000,
      available_templates: [],
      available_languages: ["vi", "en", "ja", "ko"],
      advanced_features: {
        custom_templates: true,
        advanced_export: true,
        analytics: true,
      },
    },
  ];

  for (const version of versions) {
    await prisma.storyVersion.upsert({
      where: { slug: version.slug },
      update: version,
      create: version,
    });
    console.log(`✅ Version created/updated: ${version.name}`);
  }
}

async function displaySummary() {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
