import { MobileFirstUIDemo } from "@/components/demo/MobileFirstUIDemo";

export default function MobileFirstUIDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileFirstUIDemo />
    </div>
  );
}

export const metadata = {
  title: "Mobile-First UI Components Demo",
  description:
    "Demonstration of mobile-first UI components with touch-friendly interactions",
};
