import {generateStory} from "@/lib/together";
import prisma from "@/lib/prisma";


export async function createAndSaveStory(prompt: string) {
    const content = await generateStory(prompt);

    const story = await prisma.story.create({
        data: {
            prompt,
            content,
        },
    });

    return story;
}

export async function getStories() {
    return prisma.story.findMany({
        orderBy: { createdAt: "desc" },
    });
}
