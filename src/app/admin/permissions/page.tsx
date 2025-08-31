"use client";

import { useState, useEffect } from "react";
import { useAbility } from "@/context/AbilityContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/app/api/admin/roles/route";
import { toast } from "sonner";

type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
};

export default function PermissionsPage() {
  const ability = useAbility();
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, boolean>
  >({});
  const [roleName, setRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (ability.cannot("manage", "Role")) {
      router.push("/admin");
      toast.error("You do not have permission to manage roles.");
      return;
    }

    fetchPermissions();
  }, [ability, router]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/admin/permissions");
      if (!response.ok) throw new Error("Failed to fetch permissions");
      const data = await response.json();

      const permissionsList = Array.isArray(data.permissions)
        ? data.permissions
        : Array.isArray(data)
        ? data
        : [];

      // Transform the flat permissions into categorized permissions
      const categorizedPermissions = permissionsList.map(
        (permission: string) => {
          const [category, action] = permission.split(":");
          return {
            id: permission,
            name: permission,
            description: `Can ${action} ${category}`,
            category: category.charAt(0).toUpperCase() + category.slice(1),
          };
        }
      );

      setPermissions(categorizedPermissions);

      // Initialize all permissions as unchecked
      const initialSelection: Record<string, boolean> = {};
      permissionsList.forEach((permission: string) => {
        initialSelection[permission] = false;
      });
      setSelectedPermissions(initialSelection);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // Set empty arrays on error
      setPermissions([]);
      setSelectedPermissions({});
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));
  };

  const handleSelectAll = (category: string, checked: boolean) => {
    const updatedSelection = { ...selectedPermissions };
    permissions
      .filter((p) => p.category === category)
      .forEach((p) => {
        updatedSelection[p.id] = checked;
      });
    setSelectedPermissions(updatedSelection);
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    const selected = Object.entries(selectedPermissions)
      .filter(([, isSelected]) => isSelected)
      .map(([permission]) => permission);

    if (selected.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roleName,
          permissions: selected,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save role");
      }

      toast.success("Role created successfully");
      setRoleName("");
      // Reset all checkboxes
      const resetSelection = { ...selectedPermissions };
      Object.keys(resetSelection).forEach((key) => {
        resetSelection[key] = false;
      });
      setSelectedPermissions(resetSelection);
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save role"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group permissions by category
  const permissionsByCategory = permissions.reduce<
    Record<string, Permission[]>
  >((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Permission Management
          </h1>
          <p className="text-muted-foreground">
            Manage user permissions and access levels
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Role</CardTitle>
          <CardDescription>
            Define a new role and assign specific permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roleName">Role Name</Label>
              <Select onValueChange={setRoleName} value={roleName}>
                <SelectTrigger id="roleName">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Permissions</h3>
              <div className="space-y-6">
                {Object.entries(permissionsByCategory).map(
                  ([category, categoryPermissions]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{category}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const allSelected = categoryPermissions.every(
                              (p) => selectedPermissions[p.id]
                            );
                            handleSelectAll(category, !allSelected);
                          }}
                        >
                          {categoryPermissions.every(
                            (p) => selectedPermissions[p.id]
                          )
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {categoryPermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={permission.id}
                              checked={
                                selectedPermissions[permission.id] || false
                              }
                              onCheckedChange={() =>
                                handlePermissionChange(permission.id)
                              }
                            />
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.description}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Create Role"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
