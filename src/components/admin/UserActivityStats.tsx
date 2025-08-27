"use client";

import { useMemo } from "react";
import { Activity, Users, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import { formatDistanceToNow } from "date-fns";

interface UserActivityStatsProps {
  users: User[];
  className?: string;
}

export function UserActivityStats({
  users,
  className,
}: UserActivityStatsProps) {
  const stats = useMemo(() => {
    const total = users.length;
    const online = users.filter((u) => u.activity_status === "online").length;
    const offline = users.filter((u) => u.activity_status === "offline").length;
    const never = users.filter((u) => u.activity_status === "never").length;

    // Calculate recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentlyActive = users.filter(
      (u) => u.last_login && new Date(u.last_login) > oneDayAgo
    ).length;

    // Calculate average time since last login for offline users
    const offlineUsers = users.filter(
      (u) => u.activity_status === "offline" && u.last_login
    );
    const avgTimeSinceLogin =
      offlineUsers.length > 0
        ? offlineUsers.reduce((sum, u) => {
            return sum + (Date.now() - new Date(u.last_login!).getTime());
          }, 0) / offlineUsers.length
        : 0;

    // Find most recent login
    const mostRecentLogin = users
      .filter((u) => u.last_login)
      .sort(
        (a, b) =>
          new Date(b.last_login!).getTime() - new Date(a.last_login!).getTime()
      )[0];

    return {
      total,
      online,
      offline,
      never,
      recentlyActive,
      avgTimeSinceLogin,
      mostRecentLogin,
      onlinePercentage: total > 0 ? Math.round((online / total) * 100) : 0,
      neverLoggedInPercentage:
        total > 0 ? Math.round((never / total) * 100) : 0,
    };
  }, [users]);

  const formatAverageTime = (milliseconds: number) => {
    if (milliseconds === 0) return "N/A";
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return "< 1 hour";
    }
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {/* Online Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Online Users</CardTitle>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.online}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {stats.onlinePercentage}%
            </Badge>
            of total users
          </div>
        </CardContent>
      </Card>

      {/* Recently Active */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.recentlyActive}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {stats.total > 0
                ? Math.round((stats.recentlyActive / stats.total) * 100)
                : 0}
              %
            </Badge>
            logged in today
          </div>
        </CardContent>
      </Card>

      {/* Never Logged In */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Never Logged In</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.never}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {stats.neverLoggedInPercentage}%
            </Badge>
            need activation
          </div>
        </CardContent>
      </Card>

      {/* Average Offline Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Offline Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">
            {formatAverageTime(stats.avgTimeSinceLogin)}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.offline > 0
              ? `${stats.offline} offline users`
              : "No offline users"}
          </div>
        </CardContent>
      </Card>

      {/* Most Recent Activity */}
      {stats.mostRecentLogin && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Most Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-medium">
                  {stats.mostRecentLogin.full_name}
                </div>
                <Badge variant="outline">{stats.mostRecentLogin.email}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(
                  new Date(stats.mostRecentLogin.last_login!)
                )}{" "}
                ago
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
