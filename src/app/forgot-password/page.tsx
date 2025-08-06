import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import ClientOnly from "@/components/ClientOnly";

export default function ForgotPasswordPage() {
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
      <ForgotPasswordForm />
    </ClientOnly>
  );
}
