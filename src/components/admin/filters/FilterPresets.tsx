"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Shield,
  Activity,
  Star,
} from "lucide-react";
import { UserFilters } from "@/types/user";

export interface FilterPreset {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  filters: Partial<UserFilters>;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
}

interface FilterPresetsProps {
  presets?: FilterPreset[];
  onPresetSelect: (filters: Partial<UserFilters>) => void;
  currentFilters: UserFilters;
  disabled?: boolean;
}

// Default presets based on common admin needs
const defaultPresets: FilterPreset[] = [
  {
    id: "all-users",
    label: "All Users",
    description: "Show all users",
    icon: <Users className="w-4 h-4" />,
    filters: {
      search: "",
      role: null,
      status: null,
      dateRange: null,
      activityDateRange: null,
      activity_status: null,
      hasAvatar: null,
    },
  },
  {
    id: "active-users",
    label: "Active Users",
    description: "Users who can log in",
    icon: <UserCheck className="w-4 h-4" />,
    filters: {
      status: "active",
    },
    badge: {
      text: "Active",
      variant: "default",
    },
  },
  {
    id: "inactive-users",
    label: "Inactive Users",
    description: "Banned or disabled users",
    icon: <UserX className="w-4 h-4" />,
    filters: {
      status: "inactive",
    },
    badge: {
      text: "Inactive",
      variant: "destructive",
    },
  },
  {
    id: "never-logged-in",
    label: "Never Logged In",
    description: "Users who haven't logged in yet",
    icon: <Clock className="w-4 h-4" />,
    filters: {
      activity_status: "never",
    },
    badge: {
      text: "New",
      variant: "secondary",
    },
  },
  {
    id: "recent-users",
    label: "Recent Users",
    description: "Created in the last 30 days",
    icon: <Calendar className="w-4 h-4" />,
    filters: {
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        to: new Date(),
      },
    },
    badge: {
      text: "Recent",
      variant: "outline",
    },
  },
  {
    id: "admin-users",
    label: "Admin Users",
    description: "Users with admin roles",
    icon: <Shield className="w-4 h-4" />,
    filters: {
      // This would need to be populated with actual admin role IDs
      // role: "admin-role-id",
    },
    badge: {
      text: "Admin",
      variant: "default",
    },
  },
  {
    id: "online-users",
    label: "Recently Active",
    description: "Users active in the last 7 days",
    icon: <Activity className="w-4 h-4" />,
    filters: {
      activityDateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        to: new Date(),
      },
    },
    badge: {
      text: "Active",
      variant: "default",
    },
  },
  {
    id: "users-with-avatar",
    label: "Users with Avatar",
    description: "Users who have uploaded profile pictures",
    icon: <Star className="w-4 h-4" />,
    filters: {
      hasAvatar: true,
    },
    badge: {
      text: "Avatar",
      variant: "secondary",
    },
  },
];

export function FilterPresets({
  presets = defaultPresets,
  onPresetSelect,
  currentFilters,
  disabled = false,
}: FilterPresetsProps) {
  const handlePresetClick = (preset: FilterPreset) => {
    onPresetSelect(preset.filters);
  };

  const isPresetActive = (preset: FilterPreset) => {
    // Simple check to see if the current filters match the preset
    // This is a basic implementation - you might want to make it more sophisticated
    const presetKeys = Object.keys(preset.filters);
    return presetKeys.some((key) => {
      const presetValue = preset.filters[key as keyof UserFilters];
      const currentValue = currentFilters[key as keyof UserFilters];

      // Handle date range comparison
      if (key === "dateRange" || key === "activityDateRange") {
        if (!presetValue && !currentValue) return true;
        if (!presetValue || !currentValue) return false;
        // Basic date comparison - could be more sophisticated
        return JSON.stringify(presetValue) === JSON.stringify(currentValue);
      }

      return presetValue === currentValue;
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Quick Filters</Label>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {presets.map((preset) => {
          const isActive = isPresetActive(preset);

          return (
            <Button
              key={preset.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(preset)}
              disabled={disabled}
              className="flex flex-col items-center gap-1 h-auto py-3 px-2 text-xs"
              title={preset.description}
            >
              <div className="flex items-center gap-1">
                {preset.icon}
                <span className="truncate">{preset.label}</span>
              </div>

              {preset.badge && !isActive && (
                <Badge
                  variant={preset.badge.variant || "secondary"}
                  className="text-xs px-1 py-0"
                >
                  {preset.badge.text}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Custom preset info */}
      <div className="text-xs text-muted-foreground">
        <p>
          Click a preset to quickly apply common filters. You can further
          customize the filters after selecting a preset.
        </p>
      </div>
    </div>
  );
}
