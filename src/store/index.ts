// Re-export all stores for easier imports
export { useAuthStore, type User } from "./authStore";
export { useUserStore } from "./userStore";
export { useUIStore } from "./uiStore";

// Re-export types for convenience
export type { AuthUser, User as AdminUser, PublicUser } from "@/types/user";
export { useChatStore } from "./chatStore";
