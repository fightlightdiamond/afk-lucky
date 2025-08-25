import AdvancedStoryForm from "@/components/story/AdvancedStoryForm";

export default function AdvancedStoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdvancedStoryForm />
    </div>
  );
}

export const metadata = {
  title: "Advanced Story Generator - Create Professional Stories",
  description:
    "Generate stories with advanced configuration options, templates, and customizable preferences.",
};
