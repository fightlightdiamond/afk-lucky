"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Circle } from "lucide-react";

export type StatusFilterValue =
  | "active"
  | "inactive"
  | "banned"
  | "pending"
  | "suspended"
  | "all";

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (status: StatusFilterValue) => void;
  disabled?: boolean;
  showCounts?: boolean;
  counts?: {
    active: number;
    inactive: number;
    total: number;
  };
}

export function StatusFilter({
  value,
  onChange,
  disabled = false,
  showCounts = false,
  counts,
}: StatusFilterProps) {
  const getStatusIcon = (status: StatusFilterValue) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "inactive":
      case "banned":
      case "suspended":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Circle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: StatusFilterValue) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "banned":
        return "Banned";
      case "suspended":
        return "Suspended";
      case "pending":
        return "Pending";
      default:
        return "All statuses";
    }
  };

  const getStatusWithCount = (status: StatusFilterValue) => {
    const label = getStatusLabel(status);
    if (!showCounts || !counts) return label;

    switch (status) {
      case "active":
        return `${label} (${counts.active})`;
      case "inactive":
      case "banned":
      case "suspended":
      case "pending":
        return `${label} (${counts.inactive})`;
      default:
        return `${label} (${counts.total})`;
    }
  };

  return (
    <div className="space-y-2">
      <Label>Status</Label>
      <Select
        value={value}
        onValueChange={(newValue) => onChange(newValue as StatusFilterValue)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select status">
            <div className="flex items-center gap-2">
              {getStatusIcon(value)}
              <span>{getStatusLabel(value)}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              {getStatusIcon("all")}
              <span>{getStatusWithCount("all")}</span>
            </div>
          </SelectItem>
          <SelectItem value="active">
            <div className="flex items-center gap-2">
              {getStatusIcon("active")}
              <span>{getStatusWithCount("active")}</span>
            </div>
          </SelectItem>
          <SelectItem value="inactive">
            <div className="flex items-center gap-2">
              {getStatusIcon("inactive")}
              <span>{getStatusWithCount("inactive")}</span>
            </div>
          </SelectItem>
          <SelectItem value="banned">
            <div className="flex items-center gap-2">
              {getStatusIcon("banned")}
              <span>{getStatusWithCount("banned")}</span>
            </div>
          </SelectItem>
          <SelectItem value="suspended">
            <div className="flex items-center gap-2">
              {getStatusIcon("suspended")}
              <span>{getStatusWithCount("suspended")}</span>
            </div>
          </SelectItem>
          <SelectItem value="pending">
            <div className="flex items-center gap-2">
              {getStatusIcon("pending")}
              <span>{getStatusWithCount("pending")}</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Status indicator badge */}
      {value !== "all" && (
        <div className="flex items-center gap-2">
          <Badge
            variant={value === "active" ? "default" : "destructive"}
            className="text-xs"
          >
            {getStatusIcon(value)}
            <span className="ml-1">{getStatusLabel(value)}</span>
          </Badge>
        </div>
      )}
    </div>
  );
}
