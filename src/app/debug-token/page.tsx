"use client";

import { useSession, getSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugTokenPage() {
  const { data: session, status } = useSession();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [apiTest, setApiTest] = useState<any>(null);

  const checkToken = async () => {
    console.log("🔍 Checking token storage...");

    // Check localStorage
    const localStorageKeys = Object.keys(localStorage).filter(
      (key) =>
        key.includes("nextauth") ||
        key.includes("session") ||
        key.includes("token")
    );

    // Check sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage).filter(
      (key) =>
        key.includes("nextauth") ||
        key.includes("session") ||
        key.includes("token")
    );

    // Check cookies
    const cookies = document.cookie
      .split(";")
      .map((c) => c.trim())
      .filter(
        (c) =>
          c.includes("nextauth") || c.includes("session") || c.includes("token")
      );

    // Get fresh session
    const freshSession = await getSession();

    setTokenInfo({
      localStorage: localStorageKeys.map((key) => ({
        key,
        value: localStorage.getItem(key),
      })),
      sessionStorage: sessionStorageKeys.map((key) => ({
        key,
        value: sessionStorage.getItem(key),
      })),
      cookies,
      freshSession,
      currentSession: session,
    });

    console.log("🔍 Token info:", {
      localStorage: localStorageKeys,
      sessionStorage: sessionStorageKeys,
      cookies,
      freshSession,
    });
  };

  const testAPI = async () => {
    console.log("🧪 Testing API call...");

    try {
      const response = await fetch("/api/admin/roles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 API Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const data = await response.text();
      console.log("📄 API Data:", data);

      setApiTest({
        status: response.status,
        statusText: response.statusText,
        data: data,
        success: response.ok,
      });
    } catch (error) {
      console.error("💥 API Error:", error);
      setApiTest({
        error: error.message,
        success: false,
      });
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Token & API Debug</h1>

      <Card>
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>Has Session:</strong> {!!session ? "Yes" : "No"}
          </p>
          {session && (
            <div className="mt-4">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Storage Check</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkToken} className="mb-4">
            Check Token Storage
          </Button>

          {tokenInfo && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">LocalStorage:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(tokenInfo.localStorage, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold">SessionStorage:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(tokenInfo.sessionStorage, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold">Cookies:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(tokenInfo.cookies, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testAPI} className="mb-4">
            Test /api/admin/roles
          </Button>

          {apiTest && (
            <div>
              <h3 className="font-semibold">API Response:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
