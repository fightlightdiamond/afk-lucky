"use client";

import { useEffect, useState } from "react";
import { UserManagementProvider } from "@/components/admin/UserManagementProvider";
import { UserManagementPage } from "@/components/admin/UserManagementPage";

// Mock roles data - in a real app, this would come from an API
const mockRoles = [
  { id: "admin", name: "Admin" },
  { id: "user", name: "User" },
  { id: "moderator", name: "Moderator" },
  { id: "editor", name: "Editor" },
];

export default function UsersPage() {
  const [roles, setRoles] = useState(mockRoles);

  // In a real app, you would fetch roles from an API
  useEffect(() => {
    // Fetch roles from API
    // setRoles(fetchedRoles);
  }, []);

  return (
    <UserManagementProvider>
      <UserManagementPage roles={roles} />
    </UserManagementProvider>
  );
}
