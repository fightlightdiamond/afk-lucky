import UserAnalyticsDashboard from "@/components/story/UserAnalyticsDashboard";

export default function StoryAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📊 Story Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Insights về việc sử dụng Story Generator của bạn
          </p>
        </div>

        {/* Analytics Dashboard */}
        <UserAnalyticsDashboard />

        {/* Tips Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            💡 Tips để tối ưu trải nghiệm
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">🎯 Language Mix</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • <strong>70-80% VI:</strong> Tốt cho người học tiếng Anh
                </li>
                <li>
                  • <strong>50-60% VI:</strong> Code-switching tự nhiên
                </li>
                <li>
                  • <strong>30-40% VI:</strong> Immersion với context văn hóa
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">📚 Story Length</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • <strong>Short:</strong> Quick reads, focus concepts
                </li>
                <li>
                  • <strong>Medium:</strong> Balanced narrative depth
                </li>
                <li>
                  • <strong>Long:</strong> Detailed scenarios, complex topics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Story Analytics - Usage Insights & Statistics",
  description:
    "View your story generation analytics, preferences, and usage patterns.",
};
