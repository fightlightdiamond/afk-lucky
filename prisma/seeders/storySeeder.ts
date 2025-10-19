import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedStoryTemplates() {
  console.log("🌱 Seeding story templates...");

  try {
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
      await prisma.storyTemplate.upsert({
        where: { name: template.name },
        update: {
          description: template.description,
          icon: template.icon,
          category: template.category,
          config: template.config,
          popular: template.popular,
        },
        create: template,
      });
      console.log(`✅ Template created/updated: ${template.name}`);
    }

    console.log("✅ Story templates seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding story templates:", error);
    throw error;
  }
}

export async function seedStoryVersions() {
  console.log("🌱 Seeding story versions...");

  try {
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

    console.log("✅ Story versions seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding story versions:", error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  Promise.all([seedStoryTemplates(), seedStoryVersions()])
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
