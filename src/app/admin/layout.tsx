"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2, Users, Shield, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollToTopProvider } from "@/components/ui/scroll-to-top-provider";
import { useAbility } from "@/context/AbilityContext";
import {
  ErrorProvider,
  GlobalLoadingIndicator,
} from "@/components/providers/error-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    permission: "user:read",
  },
  {
    title: "Roles",
    href: "/admin/roles",
    icon: Shield,
    permission: "role:read",
  },
  {
    title: "Permissions",
    href: "/admin/permissions",
    icon: Settings,
    permission: "role:read",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    permission: "analytics:read",
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const ability = useAbility();

  useEffect(() => {
    console.log("🔍 Admin Layout Debug:", {
      status,
      user: session?.user,
      role: session?.user?.role,
      canManageRole: ability.can("manage", "Role"),
      canReadRole: ability.can("read", "Role"),
    });

    if (status === "unauthenticated") {
      console.log("❌ Unauthenticated, redirecting to login");
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      // Check if user has admin access
      if (ability.cannot("manage", "Role") && ability.cannot("read", "Role")) {
        console.log("❌ No admin permissions, redirecting to home");
        router.push("/");
        return;
      }
    }
  }, [status, session, router, ability]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <ErrorProvider>
      <GlobalLoadingIndicator />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admin Panel
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                System Management
              </p>
            </div>

            <nav className="px-4 pb-4">
              <ul className="space-y-2">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  // Check if user has permission for this nav item
                  if (item.permission && ability.cannot("read", "Role")) {
                    return null;
                  }

                  return (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            isActive && "bg-gray-100 dark:bg-gray-700"
                          )}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.title}
                        </Button>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {adminNavItems.find((item) => item.href === pathname)
                      ?.title || "Admin"}
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome, {session.user.name}
                  </span>
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <main className="p-6">
              <ErrorBoundary context="Admin Main Content">
                <Card>
                  <CardContent className="p-6">{children}</CardContent>
                </Card>
              </ErrorBoundary>
            </main>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <ScrollToTopProvider threshold={0.9} mode={'vh'} />
      </div>
    </ErrorProvider>
  );
}
