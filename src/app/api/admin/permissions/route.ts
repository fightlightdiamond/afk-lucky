import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAbility } from "@/lib/ability";
import {
  AVAILABLE_PERMISSIONS,
  PERMISSION_CATEGORIES,
} from "@/services/permissionService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ability = createAbility(session);

    // A user who can manage roles should be able to see the list of available permissions
    if (ability.cannot("manage", "Role")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.json({
      permissions: AVAILABLE_PERMISSIONS,
      categories: PERMISSION_CATEGORIES,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
