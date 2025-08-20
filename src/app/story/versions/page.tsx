import VersionSelector from "@/components/story/VersionSelector";

export default function StoryVersionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <VersionSelector showPricing={true} />
    </div>
  );
}

export const metadata = {
  title: "Story Generator Versions - Choose Your Plan",
  description:
    "Compare and choose the perfect Story Generator version for your needs. From simple to enterprise solutions.",
};
