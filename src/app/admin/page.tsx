"use client";

import { useSession } from "next-auth/react";
import { useAbility } from "@/context/AbilityContext";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const ability = useAbility();
  const [stats, setStats] = useState({
    users: 0,
    roles: 5,
    permissions: 26,
    analytics: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user) return;

      setIsLoadingStats(true);
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          // Map API response to expected structure
          setStats({
            users: data.users?.total ?? 0,
            roles: data.roleDistribution?.length ?? 5,
            permissions: 26, // Static for now
            analytics: data.recentActivity?.length ?? 0,
          });
        } else {
          console.error(
            "Failed to fetch stats:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Keep default values on error
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [session]);

  console.log("🏠 Admin Dashboard Debug:", {
    status,
    session,
    stats,
    abilities: {
      canManageRole: ability.can("manage", "Role"),
      canReadRole: ability.can("read", "Role"),
      canReadUser: ability.can("read", "User"),
      canCreateUser: ability.can("create", "User"),
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }

  const adminCards = [
    {
      title: "Users",
      description: "Manage user accounts",
      icon: Users,
      href: "/admin/users",
      permission: "user:read",
      count: (stats?.users ?? 0).toString(),
    },
    {
      title: "Roles",
      description: "Manage user roles",
      icon: Shield,
      href: "/admin/roles",
      permission: "role:read",
      count: (stats?.roles ?? 5).toString(),
    },
    {
      title: "Permissions",
      description: "Configure permissions",
      icon: Settings,
      href: "/admin/permissions",
      permission: "role:read",
      count: (stats?.permissions ?? 26).toString(),
    },
    {
      title: "Analytics",
      description: "View system analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      permission: "analytics:read",
      count: "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}
        </p>
      </div>

      {/* Session Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Session Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Status:</strong> {status}
            </p>
            <p>
              <strong>User ID:</strong> {session.user.id}
            </p>
            <p>
              <strong>Email:</strong> {session.user.email}
            </p>
            <p>
              <strong>Role:</strong> {session.user.role?.name}
            </p>
            <p>
              <strong>Permissions:</strong>
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {session.user.role?.permissions?.map((permission) => (
                <Badge key={permission} variant="secondary" className="text-xs">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminCards.map((card) => {
          const Icon = card.icon;
          const hasPermission =
            session.user.role?.permissions?.includes(card.permission) ||
            session.user.role?.name === "ADMIN";

          return (
            <Card
              key={card.title}
              className={!hasPermission ? "opacity-50" : ""}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? "..." : card.count}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                <div className="mt-4">
                  {hasPermission ? (
                    <Link href={card.href}>
                      <Button variant="outline" size="sm" className="w-full">
                        Manage
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled
                    >
                      No Permission
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
