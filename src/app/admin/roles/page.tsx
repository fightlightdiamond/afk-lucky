"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
// Removed unused useRouter import
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { UserRole } from "@/lib/ability";
import { DEFAULT_ROLE_PERMISSIONS } from "@/services/permissionService";

interface RoleData {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

// Helper function to get default permissions for a role
function getDefaultPermissionsForRole(roleName: string): string[] {
  const roleKey = roleName as keyof typeof DEFAULT_ROLE_PERMISSIONS;
  return DEFAULT_ROLE_PERMISSIONS[roleKey] || [];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>(
    []
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  // Debug formData changes
  useEffect(() => {
    console.log("📊 FormData changed:", {
      name: formData.name,
      permissionsCount: formData.permissions.length,
      permissions: formData.permissions.slice(0, 5), // Show first 5
    });
  }, [formData]);

  // Show toast when permissions are auto-loaded
  useEffect(() => {
    if (formData.name && formData.permissions.length > 0 && isDialogOpen) {
      const defaultPermissions = getDefaultPermissionsForRole(formData.name);
      const isDefaultSet =
        defaultPermissions.length > 0 &&
        defaultPermissions.every((p) => formData.permissions.includes(p)) &&
        formData.permissions.length === defaultPermissions.length;

      if (isDefaultSet && !editingRole) {
        // Only show toast for new roles, not when editing
        console.log("✅ Default permissions loaded for role:", formData.name);
      }
    }
  }, [formData.name, formData.permissions, isDialogOpen, editingRole]);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setEditingRole(null);
  }, []);

  const groupedPermissions = useMemo(() => {
    return (
      availablePermissions?.reduce<Record<string, string[]>>(
        (acc, permission) => {
          const [category] = permission.split(":");
          if (!category) return acc;

          const categoryName =
            category.charAt(0).toUpperCase() + category.slice(1);
          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }
          acc[categoryName].push(permission);
          return acc;
        },
        {}
      ) || {}
    );
  }, [availablePermissions]);

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Fetching roles...");

      const response = await fetch("/api/admin/roles");
      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`Failed to fetch roles: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 Received data:", {
        hasRoles: !!data.roles,
        rolesCount: data.roles?.length || 0,
        dataKeys: Object.keys(data),
        firstRole: data.roles?.[0],
      });

      // Ensure roles is always an array
      const rolesArray = Array.isArray(data.roles) ? data.roles : [];
      console.log("✅ Setting roles:", rolesArray.length);
      setRoles(rolesArray);
    } catch (error) {
      console.error("❌ Error fetching roles:", error);
      toast.error("Failed to load roles");
      // Keep empty array on error
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleValueChange = useCallback((name: string, value: string) => {
    console.log("🔄 Value change:", { name, value });

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Auto-populate permissions when role name changes
      if (name === "name" && value) {
        const defaultPermissions = getDefaultPermissionsForRole(value);
        console.log("🎯 Auto-setting permissions for role:", {
          role: value,
          permissions: defaultPermissions,
          count: defaultPermissions.length,
        });

        newData.permissions = defaultPermissions;
      }

      return newData;
    });
  }, []);

  const handleEdit = useCallback((role: RoleData) => {
    console.log("🔧 Editing role:", {
      roleName: role.name,
      rolePermissions: role.permissions,
      permissionsCount: role.permissions.length,
    });

    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: [...role.permissions],
    });

    console.log("📝 Form data set:", {
      name: role.name,
      permissions: [...role.permissions],
    });

    setIsDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!roleToDelete) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/roles/${roleToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      toast.success("Role deleted successfully");
      await fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");
    } finally {
      setIsLoading(false);
      setRoleToDelete(null); // Close the dialog
    }
  }, [roleToDelete, fetchRoles]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        setIsLoading(true);
        const url = editingRole
          ? `/api/admin/roles/${editingRole.id}`
          : "/api/admin/roles";

        const method = editingRole ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save role");
        }

        await response.json();

        toast.success(
          editingRole
            ? "Role updated successfully"
            : "Role created successfully"
        );

        // Refresh roles
        await fetchRoles();
        setIsDialogOpen(false);
        resetForm();
      } catch (error) {
        console.error("Error saving role:", error);
        toast.error("Failed to save role");
      } finally {
        setIsLoading(false);
      }
    },
    [editingRole, formData, fetchRoles, resetForm]
  );

  // Fetch available permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch("/api/admin/permissions");
        if (response.ok) {
          const data = await response.json();
          setAvailablePermissions(data.permissions || data);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };
    fetchPermissions();
  }, []);

  // Toggle permission selection
  const togglePermission = useCallback((permission: string) => {
    console.log("🔄 Toggling permission:", permission);

    setFormData((prev) => {
      const wasIncluded = prev.permissions.includes(permission);
      const newPermissions = wasIncluded
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission];

      console.log("📝 Permission toggle:", {
        permission,
        wasIncluded,
        oldCount: prev.permissions.length,
        newCount: newPermissions.length,
        newPermissions: newPermissions.slice(0, 5), // Show first 5 for debug
      });

      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  }, []);

  // Toggle all permissions in a category
  const handleToggleAllCategoryPermissions = useCallback(
    (category: string, permissions: string[]) => {
      setFormData((prev) => {
        const allCategoryPermissionsSelected = permissions.every((permission) =>
          prev.permissions.includes(permission)
        );

        return {
          ...prev,
          permissions: allCategoryPermissionsSelected
            ? prev.permissions.filter((p) => !permissions.includes(p))
            : Array.from(new Set([...prev.permissions, ...permissions])),
        };
      });
    },
    []
  );

  if (isLoading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-muted-foreground">
            Manage user roles and their permissions
          </p>
        </div>
        <PermissionGuard requiredPermissions={["role:create"]}>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            View and manage user roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles && roles.length > 0 ? (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800"
                            >
                              {permission}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(role.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <PermissionGuard
                            requiredPermissions={["role:update"]}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(role)}
                              disabled={role.name === "ADMIN"}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard
                            requiredPermissions={["role:delete"]}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRoleToDelete(role.id)}
                              disabled={
                                role.name === "ADMIN" ||
                                (role._count?.users || 0) > 0
                              }
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No roles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Create New Role"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Select
                    name="name"
                    value={formData.name}
                    onValueChange={(value: string) =>
                      handleValueChange("name", value)
                    }
                    required
                  >
                    <SelectTrigger id="name">
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
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter role description"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Permissions</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const defaultPermissions = getDefaultPermissionsForRole(
                        formData.name
                      );
                      console.log("🔄 Loading default permissions:", {
                        role: formData.name,
                        permissions: defaultPermissions,
                      });
                      setFormData((prev) => ({
                        ...prev,
                        permissions: defaultPermissions,
                      }));
                    }}
                    disabled={!formData.name}
                  >
                    Load Default
                  </Button>
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                  {Object.entries(groupedPermissions).map(
                    ([category, permissions]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`cat-${category}`}
                            checked={permissions.every((p: string) =>
                              formData.permissions.includes(p)
                            )}
                            onCheckedChange={() =>
                              handleToggleAllCategoryPermissions(
                                category,
                                permissions as string[]
                              )
                            }
                          />
                          <Label
                            htmlFor={`cat-${category}`}
                            className="font-medium"
                          >
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </Label>
                        </div>
                        <div className="ml-6 space-y-2">
                          {(permissions as string[]).map(
                            (permission: string) => (
                              <div
                                key={permission}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`perm-${permission}`}
                                  checked={formData.permissions.includes(
                                    permission
                                  )}
                                  onCheckedChange={() =>
                                    togglePermission(permission)
                                  }
                                />
                                <Label
                                  htmlFor={`perm-${permission}`}
                                  className="text-sm"
                                >
                                  {permission}
                                </Label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingRole ? "Updating..." : "Creating..."}
                  </>
                ) : editingRole ? (
                  "Update Role"
                ) : (
                  "Create Role"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Continue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
