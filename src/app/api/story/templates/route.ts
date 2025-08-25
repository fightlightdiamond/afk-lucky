import { NextResponse } from "next/server";
import { storyTemplates } from "@/data/storyTemplates";
import prisma from "@/lib/prisma";

// GET - Fetch all templates
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const popular = searchParams.get("popular");

    let filteredTemplates = storyTemplates;

    // Filter by category
    if (category) {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.category === category
      );
    }

    // Filter by popularity
    if (popular === "true") {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.popular
      );
    }

    // Get usage statistics from database
    const templateStats = await prisma.story.groupBy({
      by: ["template_id"],
      where: {
        template_id: {
          not: null,
        },
      },
      _count: {
        template_id: true,
      },
    });

    // Add usage count to templates
    const templatesWithStats = filteredTemplates.map((template) => ({
      ...template,
      usage_count:
        templateStats.find((stat) => stat.template_id === template.id)?._count
          .template_id || 0,
    }));

    return NextResponse.json({
      templates: templatesWithStats,
      total: templatesWithStats.length,
    });
  } catch (error: any) {
    console.error("Template fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create custom template (for future use)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.description || !body.config) {
      return NextResponse.json(
        { error: "Name, description, and config are required" },
        { status: 400 }
      );
    }

    // Create template in database
    const template = await prisma.storyTemplate.create({
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon || "📝",
        category: body.category || "custom",
        config: body.config,
        popular: body.popular || false,
      },
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error: any) {
    console.error("Template creation error:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
