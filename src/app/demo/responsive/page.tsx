import { ResponsiveDemo } from "@/components/demo/ResponsiveDemo";

export default function ResponsiveDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <ResponsiveDemo />
    </div>
  );
}

export const metadata = {
  title: "Responsive Design Demo",
  description:
    "Demonstration of mobile-first responsive utilities and device detection",
};
