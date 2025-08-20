"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Zap,
  Settings,
  BarChart3,
  Sparkles,
  Crown,
  Layers,
} from "lucide-react";

const navigationItems = [
  {
    name: "Simple Story",
    href: "/story",
    icon: BookOpen,
    description: "Quick story generation",
    badge: "Free",
  },
  {
    name: "Advanced Story",
    href: "/story/advanced",
    icon: Zap,
    description: "Professional templates & settings",
    badge: "Free",
  },
  {
    name: "Pro Story",
    href: "/story/pro",
    icon: Crown,
    description: "Custom templates & bulk generation",
    badge: "Pro",
  },
  {
    name: "Versions",
    href: "/story/versions",
    icon: Layers,
    description: "Compare all versions",
  },
  {
    name: "Analytics",
    href: "/story/analytics",
    icon: BarChart3,
    description: "View generation statistics",
  },
];

export default function StoryNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-purple-600">
                StoryGen
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                  isActive
                    ? "bg-purple-50 border-purple-500 text-purple-700"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
