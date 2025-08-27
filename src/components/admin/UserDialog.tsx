"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Shield,
  User as UserIcon,
  Mail,
  Lock,
  Globe,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { User, Role } from "@/types/user";
import { PERMISSION_CATEGORIES } from "@/services/permissionService";

// Enhanced validation schema with better password requirements
const userSchema = z
  .object({
    first_name: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name must be less than 100 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "First name can only contain letters, spaces, hyphens, and apostrophes"
      ),
    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name must be less than 100 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "Last name can only contain letters, spaces, hyphens, and apostrophes"
      ),
    email: z
      .string()
      .email("Invalid email address")
      .max(255, "Email must be less than 255 characters")
      .toLowerCase(),
    password: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true; // Optional for editing
        return val.length >= 8;
      }, "Password must be at least 8 characters")
      .refine((val) => {
        if (!val) return true;
        return val.length <= 128;
      }, "Password must be less than 128 characters")
      .refine((val) => {
        if (!val) return true;
        return /[A-Z]/.test(val);
      }, "Password must contain at least one uppercase letter")
      .refine((val) => {
        if (!val) return true;
        return /[a-z]/.test(val);
      }, "Password must contain at least one lowercase letter")
      .refine((val) => {
        if (!val) return true;
        return /\d/.test(val);
      }, "Password must contain at least one number"),
    confirmPassword: z.string().optional(),
    role_id: z
      .string()
      .optional()
      .transform((val) => (val === "none" ? undefined : val)),
    is_active: z.boolean(),
    locale: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

type UserFormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  roles: Role[];
  onSubmit: (data: Omit<UserFormData, "confirmPassword">) => Promise<void>;
  isLoading?: boolean;
}

// Password strength calculator
function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  color: string;
} {
  if (!password) return { score: 0, feedback: [], color: "bg-gray-200" };

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score += 20;
  else feedback.push("Use at least 8 characters");

  if (password.length >= 12) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push("Add uppercase letters");

  if (/\d/.test(password)) score += 15;
  else feedback.push("Add numbers");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
  else feedback.push("Add special characters");

  // Complexity bonus
  if (password.length >= 16) score += 10;

  const color =
    score < 40 ? "bg-red-500" : score < 70 ? "bg-yellow-500" : "bg-green-500";

  return { score: Math.min(score, 100), feedback, color };
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  roles,
  onSubmit,
  isLoading = false,
}: UserDialogProps) {
  const isEditing = !!user;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPermissionPreview, setShowPermissionPreview] = useState(false);
  const [emailAvailability, setEmailAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
      role_id: user?.role_id || "",
      is_active: user?.is_active ?? true,
      locale: user?.locale || "en",
    },
  });

  // Watch form values for real-time validation
  const watchedEmail = form.watch("email");
  const watchedPassword = form.watch("password");
  const watchedRoleId = form.watch("role_id");

  // Debounce email for availability checking
  const debouncedEmail = useDebounce(watchedEmail, 500);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(watchedPassword || "");
  }, [watchedPassword]);

  // Get selected role and its permissions
  const selectedRole = useMemo(() => {
    if (!watchedRoleId) return null;
    return roles.find((role) => role.id === watchedRoleId) || null;
  }, [watchedRoleId, roles]);

  // Group permissions by category for better display
  const groupedPermissions = useMemo(() => {
    if (!selectedRole?.permissions) return {};

    const grouped: Record<string, string[]> = {};

    selectedRole.permissions.forEach((permission) => {
      let category = "Other";

      // Find the category for this permission
      for (const [categoryName, categoryPermissions] of Object.entries(
        PERMISSION_CATEGORIES
      )) {
        if ((categoryPermissions as readonly string[]).includes(permission)) {
          category = categoryName;
          break;
        }
      }

      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });

    return grouped;
  }, [selectedRole]);

  // Check email availability
  useEffect(() => {
    const checkEmailAvailability = async (email: string) => {
      if (
        !email ||
        !email.includes("@") ||
        (isEditing && email === user?.email)
      ) {
        setEmailAvailability({ checking: false, available: null, message: "" });
        return;
      }

      setEmailAvailability({
        checking: true,
        available: null,
        message: "Checking availability...",
      });

      try {
        const url = new URL(
          "/api/admin/users/check-email",
          window.location.origin
        );
        url.searchParams.set("email", email);
        if (isEditing && user?.id) {
          url.searchParams.set("excludeUserId", user.id);
        }

        const response = await fetch(url.toString());
        const data = await response.json();

        if (response.ok) {
          setEmailAvailability({
            checking: false,
            available: data.available,
            message: data.available
              ? "Email is available"
              : "Email is already taken",
          });
        } else {
          setEmailAvailability({
            checking: false,
            available: null,
            message: data.error || "Unable to check email availability",
          });
        }
      } catch (error) {
        console.error("Email availability check failed:", error);
        setEmailAvailability({
          checking: false,
          available: null,
          message: "Unable to check email availability",
        });
      }
    };

    if (debouncedEmail) {
      checkEmailAvailability(debouncedEmail);
    }
  }, [debouncedEmail, isEditing, user?.email, user?.id]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
        password: "",
        confirmPassword: "",
        role_id: user?.role_id || "",
        is_active: user?.is_active ?? true,
        locale: user?.locale || "en",
      });
      setEmailAvailability({ checking: false, available: null, message: "" });
    }
  }, [open, user, form]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      // Remove confirmPassword from data
      const { confirmPassword: _, ...submitData } = data;

      // If editing and no password provided, remove it from data
      if (isEditing && !submitData.password) {
        const { password: __, ...dataWithoutPassword } = submitData;
        await onSubmit(dataWithoutPassword);
      } else {
        await onSubmit(submitData);
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting user:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {isEditing ? "Edit User" : "Create New User"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information and permissions. Leave password blank to keep current password."
              : "Create a new user account with appropriate role and permissions."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 p-1"
            >
              {/* Basic Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="email"
                              placeholder="john.doe@example.com"
                              {...field}
                              className={
                                emailAvailability.available === false
                                  ? "border-red-500 focus:border-red-500"
                                  : emailAvailability.available === true
                                  ? "border-green-500 focus:border-green-500"
                                  : ""
                              }
                            />
                            {emailAvailability.checking && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                              </div>
                            )}
                            {!emailAvailability.checking &&
                              emailAvailability.available === true && (
                                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                              )}
                            {!emailAvailability.checking &&
                              emailAvailability.available === false && (
                                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
                              )}
                          </div>
                        </FormControl>
                        {emailAvailability.message && (
                          <FormDescription
                            className={
                              emailAvailability.available === false
                                ? "text-red-600"
                                : emailAvailability.available === true
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {emailAvailability.message}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Password Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password {isEditing && "(Optional)"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {isEditing
                            ? "New Password (leave blank to keep current)"
                            : "Password *"}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={
                                isEditing
                                  ? "Leave blank to keep current"
                                  : "Enter secure password"
                              }
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        {watchedPassword && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Strength:
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                                  style={{
                                    width: `${passwordStrength.score}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-medium">
                                {passwordStrength.score < 40
                                  ? "Weak"
                                  : passwordStrength.score < 70
                                  ? "Medium"
                                  : "Strong"}
                              </span>
                            </div>
                            {passwordStrength.feedback.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Suggestions:{" "}
                                {passwordStrength.feedback.join(", ")}
                              </div>
                            )}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedPassword && (
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Role and Permissions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role and Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="role_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Role</SelectItem>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{role.name}</span>
                                  <Badge variant="secondary" className="ml-2">
                                    {role.permissions?.length || 0} permissions
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedRole && (
                          <FormDescription>
                            {selectedRole.description ||
                              `${selectedRole.name} role`}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Permission Preview */}
                  {selectedRole &&
                    selectedRole.permissions &&
                    selectedRole.permissions.length > 0 && (
                      <div className="space-y-3">
                        <Separator />
                        <Collapsible
                          open={showPermissionPreview}
                          onOpenChange={setShowPermissionPreview}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-2 p-0 h-auto font-normal text-sm text-muted-foreground hover:text-foreground"
                            >
                              {showPermissionPreview ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              View Permissions (
                              {selectedRole.permissions.length})
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-3 mt-3">
                            <div className="rounded-lg border bg-muted/50 p-3">
                              <div className="space-y-3">
                                {Object.entries(groupedPermissions).map(
                                  ([category, permissions]) => (
                                    <div key={category} className="space-y-2">
                                      <h4 className="text-sm font-medium text-foreground">
                                        {category}
                                      </h4>
                                      <div className="flex flex-wrap gap-1">
                                        {permissions.map((permission) => (
                                          <Badge
                                            key={permission}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {permission}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}

                  {selectedRole &&
                    (!selectedRole.permissions ||
                      selectedRole.permissions.length === 0) && (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                        <p className="text-sm text-yellow-800">
                          This role has no permissions assigned.
                        </p>
                      </div>
                    )}

                  {!selectedRole &&
                    watchedRoleId &&
                    watchedRoleId !== "none" && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-800">
                          Selected role not found. Please choose a different
                          role.
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="locale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">🇺🇸 English</SelectItem>
                              <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                              <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                              <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                              <SelectItem value="zh">🇨🇳 中文</SelectItem>
                              <SelectItem value="fr">🇫🇷 Français</SelectItem>
                              <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                              <SelectItem value="es">🇪🇸 Español</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Active Status</FormLabel>
                            <FormDescription className="text-xs">
                              Inactive users cannot log in
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    (emailAvailability.available === false &&
                      watchedEmail !== user?.email) ||
                    emailAvailability.checking ||
                    (!isEditing && !watchedPassword) || // Require password for new users
                    (watchedPassword &&
                      watchedPassword !== form.watch("confirmPassword")) // Passwords must match
                  }
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    "Update User"
                  ) : (
                    "Create User"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
