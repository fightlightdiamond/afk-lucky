"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import { getFieldMappingSuggestions } from "@/hooks/useImport";

interface FieldMappingFormProps {
  headers: string[];
  mapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
  suggestedMapping: Record<string, string>;
}

const TARGET_FIELDS = [
  {
    key: "email",
    label: "Email",
    required: true,
    description: "User's email address",
  },
  {
    key: "first_name",
    label: "First Name",
    required: true,
    description: "User's first name",
  },
  {
    key: "last_name",
    label: "Last Name",
    required: true,
    description: "User's last name",
  },
  {
    key: "password",
    label: "Password",
    required: false,
    description: "User's password (will be generated if not provided)",
  },
  {
    key: "role",
    label: "Role",
    required: false,
    description: "User's role name (e.g., USER, ADMIN)",
  },
  {
    key: "is_active",
    label: "Active Status",
    required: false,
    description: "Whether the user is active (true/false)",
  },
  {
    key: "birthday",
    label: "Birthday",
    required: false,
    description: "User's birthday (YYYY-MM-DD format)",
  },
  {
    key: "address",
    label: "Address",
    required: false,
    description: "User's address",
  },
  {
    key: "locale",
    label: "Locale",
    required: false,
    description: "User's preferred language",
  },
  {
    key: "sex",
    label: "Gender",
    required: false,
    description: "User's gender (true for male, false for female)",
  },
  {
    key: "group_id",
    label: "Group ID",
    required: false,
    description: "User's group ID (number)",
  },
  {
    key: "slack_webhook_url",
    label: "Slack Webhook",
    required: false,
    description: "User's Slack webhook URL",
  },
];

export function FieldMappingForm({
  headers,
  mapping,
  onChange,
  suggestedMapping,
}: FieldMappingFormProps) {
  const handleMappingChange = (sourceField: string, targetField: string) => {
    const newMapping = { ...mapping };

    // Remove any existing mapping to this target field
    Object.keys(newMapping).forEach((key) => {
      if (newMapping[key] === targetField) {
        delete newMapping[key];
      }
    });

    // Add new mapping
    if (targetField && targetField !== "none") {
      newMapping[sourceField] = targetField;
    } else {
      delete newMapping[sourceField];
    }

    onChange(newMapping);
  };

  const applySuggestedMapping = () => {
    onChange(suggestedMapping);
  };

  const clearMapping = () => {
    onChange({});
  };

  const getMappedSourceField = (targetField: string): string | undefined => {
    return Object.keys(mapping).find((key) => mapping[key] === targetField);
  };

  const getUnmappedHeaders = (): string[] => {
    return headers.filter((header) => !mapping[header]);
  };

  const getMappedTargetFields = (): string[] => {
    return Object.values(mapping);
  };

  const getRequiredFieldsStatus = () => {
    const requiredFields = TARGET_FIELDS.filter((field) => field.required);
    const mappedRequired = requiredFields.filter((field) =>
      getMappedSourceField(field.key)
    );

    return {
      total: requiredFields.length,
      mapped: mappedRequired.length,
      missing: requiredFields.filter(
        (field) => !getMappedSourceField(field.key)
      ),
    };
  };

  const requiredStatus = getRequiredFieldsStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Field Mapping</CardTitle>
              <CardDescription>
                Map your file columns to user fields. Required fields must be
                mapped.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={applySuggestedMapping}
                disabled={Object.keys(suggestedMapping).length === 0}
              >
                Apply Suggestions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearMapping}
                disabled={Object.keys(mapping).length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Summary */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Mapping Status</span>
              <Badge
                variant={
                  requiredStatus.mapped === requiredStatus.total
                    ? "default"
                    : "destructive"
                }
              >
                {requiredStatus.mapped}/{requiredStatus.total} Required Fields
              </Badge>
            </div>
            {requiredStatus.missing.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Missing required fields:{" "}
                {requiredStatus.missing.map((f) => f.label).join(", ")}
              </div>
            )}
          </div>

          {/* File Headers Mapping */}
          <div className="space-y-4">
            <h4 className="font-medium">Map File Columns</h4>
            <div className="grid gap-4">
              {headers.map((header) => (
                <div key={header} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">{header}</Label>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={mapping[header] || "none"}
                      onValueChange={(value) =>
                        handleMappingChange(header, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Don't import</SelectItem>
                        {TARGET_FIELDS.map((field) => {
                          const isAlreadyMapped =
                            getMappedSourceField(field.key) &&
                            getMappedSourceField(field.key) !== header;
                          return (
                            <SelectItem
                              key={field.key}
                              value={field.key}
                              disabled={isAlreadyMapped}
                            >
                              <div className="flex items-center gap-2">
                                {field.label}
                                {field.required && (
                                  <Badge variant="outline" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                                {isAlreadyMapped && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Mapped
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Fields Status */}
          <div className="mt-8 space-y-4">
            <h4 className="font-medium">Target Fields Status</h4>
            <div className="grid gap-2">
              {TARGET_FIELDS.map((field) => {
                const sourceField = getMappedSourceField(field.key);
                const isMapped = !!sourceField;

                return (
                  <div
                    key={field.key}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      field.required && !isMapped
                        ? "border-red-200 bg-red-50"
                        : isMapped
                        ? "border-green-200 bg-green-50"
                        : "border-muted bg-muted/50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{field.label}</span>
                        {field.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {field.description}
                      </p>
                    </div>
                    <div className="text-right">
                      {isMapped ? (
                        <Badge variant="default">
                          Mapped to: {sourceField}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not mapped</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
