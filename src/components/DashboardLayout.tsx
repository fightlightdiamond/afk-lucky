"use client";

import { useAuthStore } from "@/store";
import LogoutButton from "./LogoutButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollToTopProvider } from "@/components/ui/scroll-to-top-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileQuestion, List, Plus } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    title: "Trang chủ",
    href: "/",
    icon: Home,
  },
  {
    title: "Tạo câu hỏi",
    href: "/questions/create",
    icon: Plus,
  },
  {
    title: "Danh sách câu hỏi",
    href: "/questions/list",
    icon: List,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-white shadow-md md:block">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">Lucky App</h2>
        </div>
        <nav className="mt-6">
          <ul>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                      isActive
                        ? "bg-blue-50 border-r-2 border-blue-500 text-blue-600"
                        : ""
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Lucky App</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-sm text-white bg-blue-500">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <LogoutButton variant="outline" size="sm" />
            </div>
          </div>
        </header>

        {/* Mobile menu button */}
        <div className="bg-white border-b md:hidden">
          <div className="flex px-4 py-2 space-x-4 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center px-3 py-2 text-xs ${
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto sm:p-6">{children}</main>

        {/* Scroll to Top Button */}
        <ScrollToTopProvider threshold={200} />
      </div>
    </div>
  );
}
