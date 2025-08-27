"use client";

import { useState } from "react";
import {
  Clock,
  Calendar,
  Activity,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types/user";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserActivityDetailProps {
  user: User;
  trigger?: React.ReactNode;
}

interface ActivitySession {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  isActive: boolean;
}

// Mock data for demonstration - in real app this would come from API
const getMockActivityData = (user: User) => {
  const sessions: ActivitySession[] = [];

  if (user.last_login) {
    // Recent session
    sessions.push({
      id: "1",
      startTime: user.last_login,
      endTime: user.last_logout || undefined,
      duration: user.last_logout
        ? new Date(user.last_logout).getTime() -
          new Date(user.last_login).getTime()
        : undefined,
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: {
        country: "Vietnam",
        city: "Ho Chi Minh City",
        region: "Ho Chi Minh",
      },
      deviceType: "desktop",
      browser: "Chrome 120.0",
      isActive: !user.last_logout,
    });

    // Previous sessions
    const previousDates = [
      new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    ];

    previousDates.forEach((date, index) => {
      const endTime = new Date(date.getTime() + (30 + index * 15) * 60 * 1000);
      sessions.push({
        id: `${index + 2}`,
        startTime: date.toISOString(),
        endTime: endTime.toISOString(),
        duration: endTime.getTime() - date.getTime(),
        ipAddress: `192.168.1.${101 + index}`,
        userAgent:
          index % 2 === 0
            ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
            : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: {
          country: "Vietnam",
          city: index === 0 ? "Hanoi" : "Ho Chi Minh City",
          region: index === 0 ? "Hanoi" : "Ho Chi Minh",
        },
        deviceType: index % 2 === 0 ? "mobile" : "desktop",
        browser: index % 2 === 0 ? "Safari 17.0" : "Chrome 119.0",
        isActive: false,
      });
    });
  }

  return sessions;
};

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case "mobile":
      return <Smartphone className="w-4 h-4" />;
    case "tablet":
      return <Monitor className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
};

const formatDuration = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

const getActivityStatusInfo = (user: User) => {
  switch (user.activity_status) {
    case "online":
      return {
        label: "Online",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        icon: (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        ),
        description: "Currently active",
      };
    case "offline":
      return {
        label: "Offline",
        color: "text-gray-600",
        bgColor: "bg-gray-50 border-gray-200",
        icon: <div className="w-2 h-2 bg-gray-400 rounded-full" />,
        description: user.last_login
          ? `Last seen ${formatDistanceToNow(new Date(user.last_login))} ago`
          : "Offline",
      };
    case "never":
      return {
        label: "Never logged in",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        icon: <div className="w-2 h-2 bg-red-400 rounded-full" />,
        description: "Has never logged into the system",
      };
    default:
      return {
        label: "Unknown",
        color: "text-gray-600",
        bgColor: "bg-gray-50 border-gray-200",
        icon: <div className="w-2 h-2 bg-gray-400 rounded-full" />,
        description: "Activity status unknown",
      };
  }
};

export function UserActivityDetail({ user, trigger }: UserActivityDetailProps) {
  const [open, setOpen] = useState(false);
  const sessions = getMockActivityData(user);
  const statusInfo = getActivityStatusInfo(user);

  const activeSessions = sessions.filter((s) => s.isActive);
  const recentSessions = sessions.filter((s) => !s.isActive).slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            View Activity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Activity className="w-5 h-5" />
            Activity Details - {user.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-2",
                      statusInfo.bgColor,
                      statusInfo.color
                    )}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {statusInfo.description}
                  </span>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {user.created_at && (
                    <div>
                      Member since{" "}
                      {format(new Date(user.created_at), "MMM dd, yyyy")}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Login Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Login Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {sessions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Sessions
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {activeSessions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Sessions
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.last_login
                      ? formatDistanceToNow(new Date(user.last_login))
                      : "Never"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last Login
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Active Sessions ({activeSessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {getDeviceIcon(session.deviceType)}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {session.deviceType} - {session.browser}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div>
                          <div className="font-medium text-sm">
                            Started{" "}
                            {formatDistanceToNow(new Date(session.startTime))}{" "}
                            ago
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {session.location?.city},{" "}
                            {session.location?.country}
                            <span>•</span>
                            {session.ipAddress}
                          </div>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Sessions */}
          {recentSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSessions.map((session, index) => (
                    <div key={session.id}>
                      <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {getDeviceIcon(session.deviceType)}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {session.deviceType} - {session.browser}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div>
                            <div className="font-medium text-sm">
                              {format(
                                new Date(session.startTime),
                                "MMM dd, yyyy 'at' HH:mm"
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {session.location?.city},{" "}
                              {session.location?.country}
                              <span>•</span>
                              {session.ipAddress}
                              {session.duration && (
                                <>
                                  <span>•</span>
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(session.duration)}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(session.startTime))}{" "}
                            ago
                          </div>
                          {session.endTime && (
                            <div className="text-xs text-muted-foreground">
                              Ended{" "}
                              {formatDistanceToNow(new Date(session.endTime))}{" "}
                              ago
                            </div>
                          )}
                        </div>
                      </div>
                      {index < recentSessions.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Activity */}
          {sessions.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Activity Found</h3>
                <p className="text-muted-foreground">
                  This user has never logged into the system.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
