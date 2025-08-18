import { NextResponse } from "next/server";
import {createAndSaveStory} from "@/services/storyService";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const story = await createAndSaveStory(prompt);
        return NextResponse.json(story);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Unknown error" },
            { status: 500 }
        );
    }
}
