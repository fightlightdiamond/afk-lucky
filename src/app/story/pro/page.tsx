import AdvancedStoryForm from "@/components/story/AdvancedStoryForm";
import { Crown, Zap, FileText, BarChart3 } from "lucide-react";

const proFeatures = [
  {
    icon: Crown,
    title: "Custom Templates",
    description: "Tạo và chia sẻ templates riêng của bạn",
  },
  {
    icon: Zap,
    title: "Bulk Generation",
    description: "Tạo nhiều truyện cùng lúc với batch processing",
  },
  {
    icon: FileText,
    title: "Multiple Export Formats",
    description: "Export PDF, DOCX, HTML và nhiều format khác",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Phân tích chi tiết và export data",
  },
];

export default function ProStoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Pro Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6" />
            <span className="font-semibold">Story Generator Pro</span>
            <span className="px-2 py-1 bg-white/20 rounded text-sm">
              Professional
            </span>
          </div>
          <div className="text-sm">
            200 stories/day • 1200 words max • Custom templates
          </div>
        </div>
      </div>

      {/* Pro Features Highlight */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            💎 Pro Features Available
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {proFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Story Form */}
        <AdvancedStoryForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Story Generator Pro - Professional Story Creation",
  description:
    "Professional story generation with custom templates, bulk generation, and advanced analytics.",
};
