import AdvancedStoryForm from "@/components/story/AdvancedStoryForm";
import { Building2, Users, Shield, Cloud, Headphones, Zap } from "lucide-react";

const enterpriseFeatures = [
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Làm việc nhóm với shared templates và projects",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SSO, encryption, audit logs và compliance",
  },
  {
    icon: Cloud,
    title: "Custom Deployment",
    description: "On-premise hoặc private cloud deployment",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Account manager riêng và support 24/7",
  },
  {
    icon: Zap,
    title: "Unlimited Usage",
    description: "Không giới hạn stories, words, và API calls",
  },
  {
    icon: Building2,
    title: "Custom Branding",
    description: "White-label solution với branding riêng",
  },
];

export default function EnterpriseStoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100">
      {/* Enterprise Banner */}
      <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6" />
            <span className="font-semibold">Story Generator Enterprise</span>
            <span className="px-2 py-1 bg-white/20 rounded text-sm">
              Organization
            </span>
          </div>
          <div className="text-sm">
            Unlimited • Custom deployment • Dedicated support
          </div>
        </div>
      </div>

      {/* Enterprise Features */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            🏢 Enterprise Solution
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Giải pháp toàn diện cho tổ chức và doanh nghiệp lớn
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {enterpriseFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Ready to Transform Your Organization?
              </h3>
              <p className="text-gray-600 mb-4">
                Liên hệ với team sales để được tư vấn giải pháp phù hợp
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Schedule Demo
                </button>
                <button className="border border-yellow-600 text-yellow-600 hover:bg-yellow-50 px-6 py-3 rounded-lg font-medium transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Story Form */}
        <AdvancedStoryForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Story Generator Enterprise - Organization Solution",
  description:
    "Enterprise story generation solution with team collaboration, custom deployment, and dedicated support.",
};
