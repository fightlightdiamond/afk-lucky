import { NextResponse } from "next/server";
import { getUserAnalytics } from "@/services/userPreferencesService";

// GET - Fetch user analytics
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const sessionId = searchParams.get("session_id");

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "User ID or Session ID is required" },
        { status: 400 }
      );
    }

    const analytics = await getUserAnalytics(
      userId || undefined,
      sessionId || undefined
    );

    if (!analytics) {
      return NextResponse.json({
        totalStories: 0,
        successfulStories: 0,
        successRate: 0,
        averageGenerationTime: 0,
        averageWordCount: 0,
        mostUsedLanguageRatio: 70,
        mostUsedLength: "medium",
        recentStories: [],
      });
    }

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
