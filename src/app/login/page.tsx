import LoginForm from "@/components/LoginForm";
import ClientOnly from "@/components/ClientOnly";

export default function LoginPage() {
  return (
    <ClientOnly
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="animate-pulse">
            <div className="w-96 h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </ClientOnly>
  );
}
