import { NextResponse } from "next/server";
import {getStories} from "@/services/storyService";

export async function GET() {
    try {
        const stories = await getStories();
        return NextResponse.json(stories);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Unknown error" },
            { status: 500 }
        );
    }
}
