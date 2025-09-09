"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("123456");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("🚀 Starting login process...");

    try {
      console.log("📤 Calling signIn with:", { email, password: "***" });

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("📥 SignIn result:", result);

      if (result?.error) {
        console.error("❌ Login failed:", result.error);
        toast.error("Login failed: " + result.error);
      } else if (result?.ok) {
        console.log("✅ Login successful, getting session...");
        toast.success("Login successful!");

        // Wait a bit for session to be set
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get fresh session to check role
        const session = await getSession();
        console.log("🔍 Fresh session after login:", {
          session,
          hasRole: !!session?.user?.role,
          roleName: session?.user?.role?.name,
          permissions: session?.user?.role?.permissions,
        });

        if (session?.user?.role) {
          console.log("🎭 User has role, redirecting to admin...");
          router.push("/admin");
        } else {
          console.log("⚠️ User has no role, redirecting to home...");
          router.push("/");
        }

        router.refresh();
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>Test credentials:</p>
            <p>Email: admin@example.com</p>
            <p>Password: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
