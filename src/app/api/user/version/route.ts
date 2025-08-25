import { NextResponse } from "next/server";
import {
  getUserVersion,
  checkVersionLimits,
  getUserUsageStats,
} from "@/services/versionService";
import { getVersionBySlug } from "@/data/storyVersions";

// GET - Get user's current version and usage stats
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

    // Get current version
    const versionSlug = await getUserVersion(
      userId || undefined,
      sessionId || undefined
    );
    const version = getVersionBySlug(versionSlug);

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Get usage stats
    const usageStats = await getUserUsageStats(
      userId || undefined,
      sessionId || undefined
    );

    // Check current limits
    const storyLimits = await checkVersionLimits(
      userId || undefined,
      sessionId || undefined,
      "create_story"
    );

    return NextResponse.json({
      version: {
        slug: version.slug,
        name: version.name,
        description: version.description,
        icon: version.icon,
        colorScheme: version.colorScheme,
        isFree: version.isFree,
        features: version.features,
        limitations: version.limitations,
        maxStoriesPerDay: version.maxStoriesPerDay,
        maxWordCount: version.maxWordCount,
        advancedFeatures: version.advancedFeatures,
      },
      usage: usageStats,
      limits: {
        canCreateStory: storyLimits.allowed,
        reason: storyLimits.reason,
        currentUsage: storyLimits.currentUsage,
        limit: storyLimits.limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user version:", error);
    return NextResponse.json(
      { error: "Failed to fetch version info" },
      { status: 500 }
    );
  }
}

// POST - Check specific action limits
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, session_id, action } = body;

    if (!user_id && !session_id) {
      return NextResponse.json(
        { error: "User ID or Session ID is required" },
        { status: 400 }
      );
    }

    const result = await checkVersionLimits(
      user_id,
      session_id,
      action || "create_story"
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error checking version limits:", error);
    return NextResponse.json(
      { error: "Failed to check limits" },
      { status: 500 }
    );
  }
}
