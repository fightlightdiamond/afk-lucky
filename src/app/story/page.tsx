import StoryForm from "@/components/story/StoryForm";
import UsageTracker from "@/components/story/UsageTracker";
import Link from "next/link";
import { Zap, Crown } from "lucide-react";

export default function SimpleStoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Simple Version Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📝</span>
            <span className="font-semibold">Story Generator Simple</span>
            <span className="px-2 py-1 bg-white/20 rounded text-sm">Free</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <span>10 stories/day</span>
            <span>•</span>
            <span>300 words max</span>
            <span>•</span>
            <span>2 templates</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📚 Simple Story Generator
              </h1>
              <p className="text-gray-600">
                Tạo truyện nhanh chóng với giao diện đơn giản và thân thiện
              </p>
            </div>
            <StoryForm />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Tracker */}
            <UsageTracker />

            {/* Upgrade Cards */}
            <div className="space-y-4">
              <Link
                href="/story/advanced"
                className="block p-4 bg-white rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Advanced</h3>
                    <p className="text-sm text-gray-600">
                      50 stories/day • 6 templates
                    </p>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Free
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/story/pro"
                className="block p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <Crown className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Pro</h3>
                    <p className="text-sm text-gray-600">
                      200 stories/day • Custom templates
                    </p>
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                      $9.99/mo
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Features Comparison */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Simple Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Basic story generation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  4 loading animations
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Story history
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  2 basic templates
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Fixed 70/30 language mix
                </li>
              </ul>

              <Link
                href="/story/versions"
                className="block mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Compare all versions →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Simple Story Generator - Quick & Easy Story Creation",
  description:
    "Create stories quickly with our simple, user-friendly interface. Perfect for beginners and quick story generation.",
};
