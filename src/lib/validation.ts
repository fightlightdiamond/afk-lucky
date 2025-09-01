import { z } from "zod";

// User validation schemas using Zod
export const createUserSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email too long"),
  first_name: z.string().min(1, "First name is required").max(100, "First name too long"),
  last_name: z.string().min(1, "Last name is required").max(100, "Last name too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password too long"),
  role_id: z.string().uuid("Invalid role ID").optional(),
  is_active: z.boolean().default(true),
  sex: z.boolean().default(true),
  birthday: z.string().datetime().optional(),
  address: z.string().max(500, "Address too long").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  locale: z.string().max(10, "Locale too long").optional(),
  group_id: z.number().int().positive().optional(),
  slack_webhook_url: z.string().url("Invalid Slack webhook URL").max(500, "Slack webhook URL too long").optional(),
  coin: z.string().optional(),
  send_welcome_email: z.boolean().default(false),
  force_password_change: z.boolean().default(false),
  temporary_password: z.boolean().default(false),
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().cuid("Invalid user ID"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password too long").optional(),
  update_reason: z.string().max(500, "Update reason too long").optional(),
  notify_user: z.boolean().default(false),
  clear_sessions: z.boolean().default(false),
});

export const getUsersParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).optional(),
  sortBy: z.enum(["full_name", "email", "created_at", "last_login", "role", "status", "activity_status"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  activityDateFrom: z.string().datetime().optional(),
  activityDateTo: z.string().datetime().optional(),
  hasAvatar: z.boolean().optional(),
  locale: z.string().optional(),
  group_id: z.number().int().optional(),
  activity_status: z.enum(["online", "offline", "never"]).optional(),
});

export const bulkOperationSchema = z.object({
  operation: z.enum(["ban", "unban", "activate", "deactivate", "delete", "assign_role", "export"]),
  userIds: z.array(z.string().cuid()).min(1, "At least one user must be selected"),
  roleId: z.string().uuid().optional(),
  reason: z.string().max(500).optional(),
  force: z.boolean().default(false),
  notifyUsers: z.boolean().default(false),
});

// Export validation functions
export function validateCreateUser(data: unknown) {
  const result = createUserSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    error: result.success ? undefined : { errors: result.error.issues }
  };
}

export function validateUpdateUser(data: unknown) {
  const result = updateUserSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    error: result.success ? undefined : { errors: result.error.issues }
  };
}

export function validateGetUsersParams(data: unknown) {
  const result = getUsersParamsSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    error: result.success ? undefined : { errors: result.error.issues }
  };
}

export function validateBulkUserOperation(data: unknown) {
  const result = bulkOperationSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    error: result.success ? undefined : { errors: result.error.issues }
  };
}

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUsersParamsInput = z.infer<typeof getUsersParamsSchema>;
export type BulkOperationInput = z.infer<typeof bulkOperationSchema>;
