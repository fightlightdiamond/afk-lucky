import StoryNavigation from "@/components/navigation/StoryNavigation";

export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <StoryNavigation />
      <main>{children}</main>
    </div>
  );
}

export const metadata = {
  title: "Story Generator - Create Amazing Stories",
  description:
    "Generate stories with AI using templates, advanced settings, and customizable preferences.",
};
