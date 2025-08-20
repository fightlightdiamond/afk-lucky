import Link from "next/link";
import { BookOpen, Zap, Settings, Sparkles, BarChart3 } from "lucide-react";

const features = [
  {
    title: "Language Mix Control",
    description: "Tùy chỉnh tỷ lệ Tiếng Việt/English từ 30% đến 90%",
    icon: "🌐",
    details: [
      "Slider điều chỉnh tỷ lệ ngôn ngữ",
      "Quick presets: 50/50, 70/30, 40/60, 80/20",
      "Base language và target language selection",
      "Live preview với ví dụ thực tế",
      "Bold formatting cho English words",
    ],
  },
  {
    title: "Professional Templates",
    description: "6 templates chuyên nghiệp cho các tình huống khác nhau",
    icon: "📋",
    details: [
      "Code Review Story - Developer workflow",
      "Startup Pitch - Business presentation",
      "Remote Work - Work-life balance",
      "Data Science - Analytics insights",
      "Agile Scrum - Team collaboration",
      "English Learning - Language acquisition",
    ],
  },
  {
    title: "Advanced Configuration",
    description: "Cấu hình chi tiết cho storytelling style và content",
    icon: "⚙️",
    details: [
      "4 storytelling styles: Jewish, Western, Eastern, Modern",
      "4 tone options: Formal, Casual, Friendly, Professional",
      "6 readability levels: A1-C2",
      "Custom vocabulary focus",
      "Structure options: Quiz, Glossary, Sections",
    ],
  },
  {
    title: "Interactive Loading",
    description: "4 kiểu loading experience độc đáo",
    icon: "✨",
    details: [
      "Interactive - Click để thêm energy",
      "Smart Progress - Thanh tiến trình thông minh",
      "Magical - Particle effects và animations",
      "Stages - Hiển thị từng giai đoạn chi tiết",
    ],
  },
];

const examples = [
  {
    title: "Vietnamese-focused (70%)",
    content:
      "Anh ấy là một **developer** giỏi, luôn viết **clean code** và thực hiện **code review** cẩn thận.",
    ratio: "70% VI - 30% EN",
  },
  {
    title: "Balanced Mix (50%)",
    content:
      "He is a talented **developer**, anh ấy luôn writes **clean code** and performs careful **reviews**.",
    ratio: "50% VI - 50% EN",
  },
  {
    title: "English-focused (30%)",
    content:
      "He is a talented **developer** who always writes **clean code** và thực hiện **review** cẩn thận.",
    ratio: "30% VI - 70% EN",
  },
];

export default function StoryDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎭 Advanced Story Generator Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Khám phá các tính năng nâng cao để tạo ra những câu chuyện chuyên
            nghiệp
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/story/advanced"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Zap className="w-5 h-5 mr-2" />
              Try Advanced Generator
            </Link>
            <Link
              href="/story"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Simple Generator
            </Link>
            <Link
              href="/loading-showcase"
              className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Loading Showcase
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{feature.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {feature.details.map((detail, idx) => (
                  <li
                    key={idx}
                    className="flex items-center text-sm text-gray-700"
                  >
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Language Mix Examples */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🌐 Language Mix Examples
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((example, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">
                    {example.title}
                  </h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {example.ratio}
                  </span>
                </div>
                <p
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: example.content }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Templates Preview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            📚 Professional Templates
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="text-2xl mb-3">👨‍💻</div>
              <h4 className="font-bold text-blue-800 mb-2">
                Code Review Story
              </h4>
              <p className="text-blue-700 text-sm mb-3">
                Developer học cách nhận feedback và refactor code có chủ đích
              </p>
              <div className="flex flex-wrap gap-1">
                {["refactor", "pull request", "code smell"].map((term) => (
                  <span
                    key={term}
                    className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="text-2xl mb-3">🚀</div>
              <h4 className="font-bold text-green-800 mb-2">Startup Pitch</h4>
              <p className="text-green-700 text-sm mb-3">
                Entrepreneur chuẩn bị pitch deck thuyết phục investor
              </p>
              <div className="flex flex-wrap gap-1">
                {["pitch deck", "investor", "MVP"].map((term) => (
                  <span
                    key={term}
                    className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="text-2xl mb-3">🔄</div>
              <h4 className="font-bold text-purple-800 mb-2">Agile Scrum</h4>
              <p className="text-purple-700 text-sm mb-3">
                Development team học cách làm việc theo Agile methodology
              </p>
              <div className="flex flex-wrap gap-1">
                {["sprint", "backlog", "velocity"].map((term) => (
                  <span
                    key={term}
                    className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Preview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            ⚙️ Configuration Options
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Language Ratio
              </h4>
              <p className="text-sm text-gray-600">30% - 90% Vietnamese</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Story Length</h4>
              <p className="text-sm text-gray-600">Short, Medium, Long</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Readability</h4>
              <p className="text-sm text-gray-600">A1 - C2 Levels</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Structure</h4>
              <p className="text-sm text-gray-600">Quiz, Glossary, Sections</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Amazing Stories?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Sử dụng Advanced Story Generator để tạo ra những câu chuyện chuyên
            nghiệp với cấu hình tùy chỉnh
          </p>
          <Link
            href="/story/advanced"
            className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            <Zap className="w-6 h-6 mr-2" />
            Start Creating Stories
          </Link>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Story Generator Demo - Advanced Features Showcase",
  description:
    "Explore advanced story generation features including language mix control, professional templates, and interactive loading experiences.",
};
