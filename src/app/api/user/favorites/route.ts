import { NextResponse } from "next/server";
import {
  addFavoriteTemplate,
  removeFavoriteTemplate,
  getFavoriteTemplates,
} from "@/services/userPreferencesService";

// GET - Fetch favorite templates
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const sessionId = searchParams.get("session_id");

    const favorites = await getFavoriteTemplates(
      userId || undefined,
      sessionId || undefined
    );

    return NextResponse.json({ favorites });
  } catch (error: any) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST - Add template to favorites
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { template_id, user_id, session_id } = body;

    if (!template_id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    const success = await addFavoriteTemplate(template_id, user_id, session_id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to add favorite" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE - Remove template from favorites
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("template_id");
    const userId = searchParams.get("user_id");
    const sessionId = searchParams.get("session_id");

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    const success = await removeFavoriteTemplate(
      templateId,
      userId || undefined,
      sessionId || undefined
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to remove favorite" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
