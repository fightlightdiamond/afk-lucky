"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useAbility } from "@/context/AbilityContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const ability = useAbility();

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Auth Test Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Status:</strong> {status}
          </p>

          {status === "authenticated" ? (
            <div className="space-y-4 mt-4">
              <Button onClick={() => signOut()}>Sign Out</Button>

              <div>
                <h3 className="font-semibold">Session Data:</h3>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold">Abilities:</h3>
                <div className="space-y-2 mt-2">
                  <p>
                    Can manage Role:{" "}
                    {ability.can("manage", "Role") ? "✅" : "❌"}
                  </p>
                  <p>
                    Can read Role: {ability.can("read", "Role") ? "✅" : "❌"}
                  </p>
                  <p>
                    Can create User:{" "}
                    {ability.can("create", "User") ? "✅" : "❌"}
                  </p>
                  <p>
                    Can read User: {ability.can("read", "User") ? "✅" : "❌"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Button onClick={() => signIn()}>Sign In</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
