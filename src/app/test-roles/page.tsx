"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestRolesPage() {
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const result = await signIn("credentials", {
      email: "admin@example.com",
      password: "123456",
      redirect: false,
    });

    if (result?.error) {
      setError("Login failed: " + result.error);
    }
  };

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching roles...");
      const response = await fetch("/api/admin/roles");
      console.log("📡 Response:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("📊 Received data:", data);
      setRoles(data.roles || []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Test Roles Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Status: {status}</p>

          {session ? (
            <div>
              <p>Logged in as: {session.user?.email}</p>
              <p>Role: {session.user?.role?.name}</p>
              <p>Permissions: {session.user?.role?.permissions?.length || 0}</p>
              <Button onClick={() => signOut()}>Sign Out</Button>
            </div>
          ) : (
            <Button onClick={handleLogin}>Login as Admin</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={fetchRoles} disabled={loading}>
            {loading ? "Loading..." : "Fetch Roles"}
          </Button>

          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded">
              Error: {error}
            </div>
          )}

          {roles.length > 0 && (
            <div>
              <p>Found {roles.length} roles:</p>
              <ul className="list-disc list-inside">
                {roles.map((role) => (
                  <li key={role.id}>
                    {role.name} - {role.permissions?.length || 0} permissions
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
