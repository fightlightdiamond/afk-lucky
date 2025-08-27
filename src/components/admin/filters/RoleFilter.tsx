"use client";

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface RoleFilterProps {
  selectedRoles: string[];
  onChange: (roleIds: string[]) => void;
  roles: Role[];
  disabled?: boolean;
  placeholder?: string;
  maxDisplayCount?: number;
}

export function RoleFilter({
  selectedRoles,
  onChange,
  roles,
  disabled = false,
  placeholder = "Select roles",
  maxDisplayCount = 2,
}: RoleFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleToggle = (roleId: string) => {
    const newSelection = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id) => id !== roleId)
      : [...selectedRoles, roleId];
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedRoles.length === roles.length) {
      onChange([]);
    } else {
      onChange(roles.map((role) => role.id));
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    if (selectedRoles.length === 0) {
      return placeholder;
    }

    if (selectedRoles.length === 1) {
      const role = roles.find((r) => r.id === selectedRoles[0]);
      return role?.name || "Unknown role";
    }

    if (selectedRoles.length <= maxDisplayCount) {
      return selectedRoles
        .map((id) => roles.find((r) => r.id === id)?.name)
        .filter(Boolean)
        .join(", ");
    }

    return `${selectedRoles.length} roles selected`;
  };

  const isAllSelected =
    selectedRoles.length === roles.length && roles.length > 0;
  const isIndeterminate =
    selectedRoles.length > 0 && selectedRoles.length < roles.length;

  return (
    <div className="space-y-2">
      <Label>Role</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={
                    isIndeterminate
                      ? "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      : ""
                  }
                />
                <Label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({roles.length})
                </Label>
              </div>
              {selectedRoles.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-auto p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <div className="p-1">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`role-${role.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {role.name}
                    </Label>
                    {role.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {role.description}
                      </p>
                    )}
                  </div>
                  {selectedRoles.includes(role.id) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
          {selectedRoles.length > 0 && (
            <div className="p-3 border-t">
              <div className="flex flex-wrap gap-1">
                {selectedRoles.slice(0, 3).map((roleId) => {
                  const role = roles.find((r) => r.id === roleId);
                  return role ? (
                    <Badge key={roleId} variant="secondary" className="text-xs">
                      {role.name}
                    </Badge>
                  ) : null;
                })}
                {selectedRoles.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedRoles.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
