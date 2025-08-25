export interface StoryVersionFeature {
  name: string;
  description: string;
  available: boolean;
  icon?: string;
}

export interface StoryVersionConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  icon: string;
  colorScheme: "blue" | "purple" | "green" | "gold";

  // Pricing
  isFree: boolean;
  priceMonthly?: number;
  priceYearly?: number;

  // Limitations
  maxStoriesPerDay?: number;
  maxWordCount?: number;

  // Available features
  features: StoryVersionFeature[];
  limitations: string[];

  // Configuration
  availableTemplates: string[]; // 'all' or specific template IDs
  availableLanguages: string[];
  advancedFeatures: {
    customTemplates: boolean;
    bulkGeneration: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    analytics: boolean;
    exportFormats: string[]; // ['txt', 'pdf', 'docx', 'html']
    collaborativeEditing: boolean;
    versionHistory: boolean;
    customBranding: boolean;
  };

  // Status
  isActive: boolean;
  isBeta: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
}

export const storyVersions: StoryVersionConfig[] = [
  {
    id: "simple",
    name: "Simple",
    slug: "simple",
    description: "Tạo truyện nhanh chóng với giao diện đơn giản",
    tagline: "Perfect for quick story creation",
    icon: "📝",
    colorScheme: "blue",
    isFree: true,
    maxStoriesPerDay: 10,
    maxWordCount: 300,
    features: [
      {
        name: "Basic Story Generation",
        description: "Tạo truyện cơ bản",
        available: true,
        icon: "✍️",
      },
      {
        name: "Loading Animations",
        description: "4 kiểu loading đẹp mắt",
        available: true,
        icon: "✨",
      },
      {
        name: "Story History",
        description: "Lưu lịch sử truyện",
        available: true,
        icon: "📚",
      },
      {
        name: "Basic Templates",
        description: "2 templates cơ bản",
        available: true,
        icon: "📋",
      },
      {
        name: "Vietnamese/English Mix",
        description: "Tỷ lệ ngôn ngữ cố định 70/30",
        available: true,
        icon: "🌐",
      },
    ],
    limitations: [
      "Tối đa 10 truyện/ngày",
      "Tối đa 300 từ/truyện",
      "Chỉ 2 templates cơ bản",
      "Không thể tùy chỉnh tỷ lệ ngôn ngữ",
      "Không có analytics",
    ],
    availableTemplates: ["dev-code-review", "remote-work"],
    availableLanguages: ["vi", "en"],
    advancedFeatures: {
      customTemplates: false,
      bulkGeneration: false,
      apiAccess: false,
      prioritySupport: false,
      analytics: false,
      exportFormats: ["txt"],
      collaborativeEditing: false,
      versionHistory: false,
      customBranding: false,
    },
    isActive: true,
    isBeta: false,
  },

  {
    id: "advanced",
    name: "Advanced",
    slug: "advanced",
    description: "Tùy chỉnh chi tiết với templates chuyên nghiệp",
    tagline: "Full customization & professional templates",
    icon: "🚀",
    colorScheme: "purple",
    isFree: true,
    maxStoriesPerDay: 50,
    maxWordCount: 600,
    features: [
      {
        name: "Advanced Configuration",
        description: "Tùy chỉnh chi tiết mọi thông số",
        available: true,
        icon: "⚙️",
      },
      {
        name: "Professional Templates",
        description: "6 templates chuyên nghiệp",
        available: true,
        icon: "📋",
      },
      {
        name: "Language Mix Control",
        description: "Tùy chỉnh tỷ lệ 30-90%",
        available: true,
        icon: "🌐",
      },
      {
        name: "Style & Tone Options",
        description: "4 styles, 4 tones, 6 levels",
        available: true,
        icon: "🎨",
      },
      {
        name: "User Preferences",
        description: "Lưu và đồng bộ settings",
        available: true,
        icon: "💾",
      },
      {
        name: "Basic Analytics",
        description: "Thống kê sử dụng cơ bản",
        available: true,
        icon: "📊",
      },
      {
        name: "Favorite Templates",
        description: "Đánh dấu templates yêu thích",
        available: true,
        icon: "❤️",
      },
    ],
    limitations: [
      "Tối đa 50 truyện/ngày",
      "Tối đa 600 từ/truyện",
      "Không có custom templates",
      "Export chỉ TXT và HTML",
    ],
    availableTemplates: ["all"],
    availableLanguages: ["vi", "en"],
    advancedFeatures: {
      customTemplates: false,
      bulkGeneration: false,
      apiAccess: false,
      prioritySupport: false,
      analytics: true,
      exportFormats: ["txt", "html"],
      collaborativeEditing: false,
      versionHistory: false,
      customBranding: false,
    },
    isActive: true,
    isBeta: false,
    isPopular: true,
  },

  {
    id: "pro",
    name: "Pro",
    slug: "pro",
    description: "Dành cho creators và educators chuyên nghiệp",
    tagline: "For professional creators & educators",
    icon: "💎",
    colorScheme: "green",
    isFree: false,
    priceMonthly: 9.99,
    priceYearly: 99.99,
    maxStoriesPerDay: 200,
    maxWordCount: 1200,
    features: [
      {
        name: "Unlimited Advanced Features",
        description: "Tất cả tính năng Advanced",
        available: true,
        icon: "🚀",
      },
      {
        name: "Custom Templates",
        description: "Tạo templates riêng",
        available: true,
        icon: "🛠️",
      },
      {
        name: "Bulk Generation",
        description: "Tạo nhiều truyện cùng lúc",
        available: true,
        icon: "⚡",
      },
      {
        name: "Advanced Analytics",
        description: "Phân tích chi tiết, export data",
        available: true,
        icon: "📈",
      },
      {
        name: "Multiple Export Formats",
        description: "PDF, DOCX, HTML, TXT",
        available: true,
        icon: "📄",
      },
      {
        name: "Version History",
        description: "Lưu và khôi phục các phiên bản",
        available: true,
        icon: "🕐",
      },
      {
        name: "Priority Support",
        description: "Hỗ trợ ưu tiên 24/7",
        available: true,
        icon: "🎧",
      },
      {
        name: "API Access",
        description: "Tích hợp vào ứng dụng khác",
        available: true,
        icon: "🔌",
      },
    ],
    limitations: ["Tối đa 200 truyện/ngày", "Tối đa 1200 từ/truyện"],
    availableTemplates: ["all"],
    availableLanguages: ["vi", "en", "zh", "ja", "ko"],
    advancedFeatures: {
      customTemplates: true,
      bulkGeneration: true,
      apiAccess: true,
      prioritySupport: true,
      analytics: true,
      exportFormats: ["txt", "html", "pdf", "docx"],
      collaborativeEditing: false,
      versionHistory: true,
      customBranding: false,
    },
    isActive: true,
    isBeta: false,
    isRecommended: true,
  },

  {
    id: "enterprise",
    name: "Enterprise",
    slug: "enterprise",
    description: "Giải pháp toàn diện cho tổ chức và doanh nghiệp",
    tagline: "Complete solution for organizations",
    icon: "🏢",
    colorScheme: "gold",
    isFree: false,
    priceMonthly: 49.99,
    priceYearly: 499.99,
    features: [
      {
        name: "Unlimited Everything",
        description: "Không giới hạn stories và word count",
        available: true,
        icon: "∞",
      },
      {
        name: "Team Collaboration",
        description: "Làm việc nhóm, chia sẻ templates",
        available: true,
        icon: "👥",
      },
      {
        name: "Custom Branding",
        description: "Logo và branding riêng",
        available: true,
        icon: "🎨",
      },
      {
        name: "Advanced API",
        description: "Full API access với rate limit cao",
        available: true,
        icon: "🚀",
      },
      {
        name: "SSO Integration",
        description: "Single Sign-On với hệ thống hiện có",
        available: true,
        icon: "🔐",
      },
      {
        name: "Dedicated Support",
        description: "Account manager riêng",
        available: true,
        icon: "🤝",
      },
      {
        name: "Custom Deployment",
        description: "On-premise hoặc private cloud",
        available: true,
        icon: "☁️",
      },
      {
        name: "Advanced Security",
        description: "Encryption, audit logs, compliance",
        available: true,
        icon: "🛡️",
      },
    ],
    limitations: [],
    availableTemplates: ["all"],
    availableLanguages: ["vi", "en", "zh", "ja", "ko", "th", "id", "ms"],
    advancedFeatures: {
      customTemplates: true,
      bulkGeneration: true,
      apiAccess: true,
      prioritySupport: true,
      analytics: true,
      exportFormats: ["txt", "html", "pdf", "docx", "json", "xml"],
      collaborativeEditing: true,
      versionHistory: true,
      customBranding: true,
    },
    isActive: true,
    isBeta: false,
  },
];

export const getVersionBySlug = (
  slug: string
): StoryVersionConfig | undefined => {
  return storyVersions.find((version) => version.slug === slug);
};

export const getFreeVersions = (): StoryVersionConfig[] => {
  return storyVersions.filter((version) => version.isFree);
};

export const getPaidVersions = (): StoryVersionConfig[] => {
  return storyVersions.filter((version) => !version.isFree);
};

export const getActiveVersions = (): StoryVersionConfig[] => {
  return storyVersions.filter((version) => version.isActive);
};
