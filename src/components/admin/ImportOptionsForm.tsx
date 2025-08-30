"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImportOptions, Role } from "@/types/user";

interface ImportOptionsFormProps {
  options: ImportOptions;
  onChange: (options: ImportOptions) => void;
  roles: Role[];
}

export function ImportOptionsForm({
  options,
  onChange,
  roles,
}: ImportOptionsFormProps) {
  const handleChange = (key: keyof ImportOptions, value: unknown) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Duplicate Handling</CardTitle>
          <CardDescription>
            Configure how to handle users with existing email addresses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="skip-duplicates">Skip Duplicates</Label>
              <p className="text-sm text-muted-foreground">
                Skip users with existing email addresses
              </p>
            </div>
            <Switch
              id="skip-duplicates"
              checked={options.skipDuplicates}
              onCheckedChange={(checked) =>
                handleChange("skipDuplicates", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="update-existing">Update Existing</Label>
              <p className="text-sm text-muted-foreground">
                Update existing users with new data from import
              </p>
            </div>
            <Switch
              id="update-existing"
              checked={options.updateExisting}
              onCheckedChange={(checked) =>
                handleChange("updateExisting", checked)
              }
              disabled={options.skipDuplicates}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Validation Options</CardTitle>
          <CardDescription>
            Configure how to handle validation errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="skip-invalid">Skip Invalid Rows</Label>
              <p className="text-sm text-muted-foreground">
                Continue import even if some rows have validation errors
              </p>
            </div>
            <Switch
              id="skip-invalid"
              checked={options.skipInvalidRows}
              onCheckedChange={(checked) =>
                handleChange("skipInvalidRows", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Values</CardTitle>
          <CardDescription>
            Set default values for optional fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-role">Default Role</Label>
            <Select
              value={options.defaultRole || "none"}
              onValueChange={(value) =>
                handleChange(
                  "defaultRole",
                  value === "none" ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No default role</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Role assigned to users when no role is specified in import data
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="default-status">Default Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Default active status for imported users
              </p>
            </div>
            <Switch
              id="default-status"
              checked={options.defaultStatus}
              onCheckedChange={(checked) =>
                handleChange("defaultStatus", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Notifications</CardTitle>
          <CardDescription>
            Configure notifications sent to imported users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="welcome-email">Send Welcome Email</Label>
              <p className="text-sm text-muted-foreground">
                Send welcome email to newly imported users
              </p>
            </div>
            <Switch
              id="welcome-email"
              checked={options.sendWelcomeEmail}
              onCheckedChange={(checked) =>
                handleChange("sendWelcomeEmail", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="password-reset">Require Password Reset</Label>
              <p className="text-sm text-muted-foreground">
                Force users to reset their password on first login
              </p>
            </div>
            <Switch
              id="password-reset"
              checked={options.requirePasswordReset}
              onCheckedChange={(checked) =>
                handleChange("requirePasswordReset", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
