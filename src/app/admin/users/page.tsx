"use client";

import { useEffect, useState } from "react";
import { UserManagementProvider } from "@/components/admin/UserManagementProvider";
import { UserManagementPage } from "@/components/admin/UserManagementPage";
import { UserManagementPageOptimized } from "@/components/admin/UserManagementPageOptimized";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Table, Infinity, HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock roles data - in a real app, this would come from an API
const mockRoles = [
  { id: "admin", name: "Admin" },
  { id: "user", name: "User" },
  { id: "moderator", name: "Moderator" },
  { id: "editor", name: "Editor" },
];

export default function UsersPage() {
  const [roles, setRoles] = useState(mockRoles);
  const [useOptimizedVersion, setUseOptimizedVersion] = useState(true);
  const [enableVirtualScrolling, setEnableVirtualScrolling] = useState(false);
  const [enableInfiniteScroll, setEnableInfiniteScroll] = useState(false);

  // In a real app, you would fetch roles from an API
  useEffect(() => {
    // Fetch roles from API
    // setRoles(fetchedRoles);
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header with Help */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions across your
              organization
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2 max-w-sm">
                <p className="font-medium">User Management Help</p>
                <ul className="text-sm space-y-1">
                  <li>• Create and edit user accounts</li>
                  <li>• Assign roles and permissions</li>
                  <li>• Manage user status and activity</li>
                  <li>• Export and import user data</li>
                  <li>• Bulk operations for multiple users</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Performance Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Performance Settings
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configure performance optimizations for large datasets</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Mode:</span>
                <Button
                  variant={useOptimizedVersion ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseOptimizedVersion(!useOptimizedVersion)}
                  className="gap-2"
                >
                  {useOptimizedVersion ? "Optimized" : "Standard"}
                  {useOptimizedVersion && (
                    <Badge variant="secondary" className="text-xs">
                      Fast
                    </Badge>
                  )}
                </Button>
              </div>

              {useOptimizedVersion && (
                <>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            enableVirtualScrolling ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setEnableVirtualScrolling(!enableVirtualScrolling)
                          }
                          className="gap-2"
                        >
                          <Table className="w-3 h-3" />
                          Virtual Scroll
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Render only visible rows for better performance with
                          large datasets
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={enableInfiniteScroll ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setEnableInfiniteScroll(!enableInfiniteScroll)
                          }
                          className="gap-2"
                        >
                          <Infinity className="w-3 h-3" />
                          Infinite Scroll
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Load more users automatically as you scroll</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}

              <div className="ml-auto text-xs text-muted-foreground">
                {useOptimizedVersion ? (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Performance optimizations enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Standard mode
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management Interface */}
        <UserManagementProvider>
          {useOptimizedVersion ? (
            <UserManagementPageOptimized
              enableVirtualScrolling={enableVirtualScrolling}
              enableInfiniteScroll={enableInfiniteScroll}
              containerHeight={600}
              itemHeight={73}
            />
          ) : (
            <UserManagementPage roles={roles} />
          )}
        </UserManagementProvider>
      </div>
    </TooltipProvider>
  );
}
