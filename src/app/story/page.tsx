import StoryForm from "@/components/story/StoryForm";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">
                AI Story Chêm Generator
            </h1>
            <StoryForm/>
        </main>
    );
}
