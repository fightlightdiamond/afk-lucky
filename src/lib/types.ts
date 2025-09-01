// Centralized type definitions using Prisma generated types
import { User as PrismaUser, Role as PrismaRole, UserRole } from "@prisma/client";

// Re-export Prisma types
export { UserRole } from "@prisma/client";

// Enhanced User type with computed fields
export interface User extends Omit<PrismaUser, 'coin' | 'created_at' | 'updated_at' | 'last_login' | 'last_logout' | 'birthday' | 'deleted_at'> {
  // Convert BigInt to string for JSON serialization
  coin?: string;
  // Convert dates to ISO strings
  created_at: string;
  updated_at: string;
  last_login?: string;
  last_logout?: string;
  birthday?: string;
  deleted_at?: string;
  // Computed fields
  full_name: string;
  display_name: string;
  status: "active" | "inactive";
  activity_status: "online" | "offline" | "never";
  age?: number;
  // Role relation
  role?: {
    id: string;
    name: UserRole;
    description?: string;
    permissions: string[];
  };
}

// Enhanced Role type
export interface Role extends Omit<PrismaRole, 'created_at' | 'updated_at'> {
  created_at: string;
  updated_at: string;
  user_count?: number;
  is_system_role?: boolean;
}

// User creation request
export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role_id?: string;
  is_active?: boolean;
  sex?: boolean;
  birthday?: string;
  address?: string;
  avatar?: string;
  locale?: string;
  group_id?: number;
  slack_webhook_url?: string;
  coin?: string;
}

// User update request
export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id?: string;
  update_reason?: string;
  notify_user?: boolean;
  clear_sessions?: boolean;
}
