import { generateStory } from "@/lib/together";
import prisma from "@/lib/prisma";
import type { Story } from "@/types/story";

export async function createAndSaveStory(prompt: string): Promise<Story> {
    try {
        const content = await generateStory(prompt);
        const story = await prisma.story.create({
            data: { prompt, content },
        });
        return {
            id: story.id,
            prompt: story.prompt,
            content: story.content,
            createdAt: story.createdAt.toISOString(),
        };
    } catch (error) {
        console.error("Error creating story:", error);
        throw error;
    }
}

export async function getStories(): Promise<Story[]> {
    try {
        const stories = await prisma.story.findMany({
            orderBy: { createdAt: "desc" },
        });
        return stories.map((s) => ({
            id: s.id,
            prompt: s.prompt,
            content: s.content,
            createdAt: s.createdAt.toISOString(),
        }));
    } catch (error) {
        console.error("Error fetching stories:", error);
        throw error;
    }
}
