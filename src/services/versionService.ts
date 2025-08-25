import { prisma } from "@/lib/prisma";
import { storyVersions, getVersionBySlug } from "@/data/storyVersions";

// Get user's current version
export async function getUserVersion(
  userId?: string,
  sessionId?: string
): Promise<string> {
  try {
    if (!userId && !sessionId) return "simple"; // Default for anonymous

    // For authenticated users, check subscription
    if (userId) {
      const subscription = await prisma.userSubscription.findUnique({
        where: { user_id: userId },
      });

      if (subscription && subscription.status === "active") {
        // Check if subscription is still valid
        if (!subscription.expires_at || subscription.expires_at > new Date()) {
          return subscription.version_slug;
        } else {
          // Subscription expired, update status
          await prisma.userSubscription.update({
            where: { user_id: userId },
            data: { status: "expired" },
          });
        }
      }
    }

    // Default to simple version
    return "simple";
  } catch (error) {
    console.error("Error getting user version:", error);
    return "simple";
  }
}

// Check if user can perform action based on their version
export async function checkVersionLimits(
  userId?: string,
  sessionId?: string,
  action:
    | "create_story"
    | "export"
    | "custom_template"
    | "api_access" = "create_story"
): Promise<{
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
}> {
  try {
    const versionSlug = await getUserVersion(userId, sessionId);
    const version = getVersionBySlug(versionSlug);

    if (!version) {
      return { allowed: false, reason: "Invalid version" };
    }

    // Check feature availability
    switch (action) {
      case "custom_template":
        if (!version.advancedFeatures.customTemplates) {
          return {
            allowed: false,
            reason: "Custom templates not available in your plan",
          };
        }
        break;

      case "api_access":
        if (!version.advancedFeatures.apiAccess) {
          return {
            allowed: false,
            reason: "API access not available in your plan",
          };
        }
        break;

      case "export":
        if (version.advancedFeatures.exportFormats.length === 0) {
          return {
            allowed: false,
            reason: "Export not available in your plan",
          };
        }
        break;
    }

    // Check daily limits for story creation
    if (action === "create_story" && version.maxStoriesPerDay) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayUsage = await prisma.storyUsageAnalytics.count({
        where: {
          ...(userId ? { user_id: userId } : { session_id: sessionId }),
          created_at: { gte: today },
          success: true,
        },
      });

      if (todayUsage >= version.maxStoriesPerDay) {
        return {
          allowed: false,
          reason: `Daily limit reached (${version.maxStoriesPerDay} stories/day)`,
          currentUsage: todayUsage,
          limit: version.maxStoriesPerDay,
        };
      }

      return {
        allowed: true,
        currentUsage: todayUsage,
        limit: version.maxStoriesPerDay,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking version limits:", error);
    return { allowed: false, reason: "Error checking limits" };
  }
}

// Create or update user subscription
export async function updateUserSubscription(
  userId: string,
  versionSlug: string,
  status: "active" | "trial" | "inactive" | "expired" = "active",
  expiresAt?: Date
): Promise<boolean> {
  try {
    const version = getVersionBySlug(versionSlug);
    if (!version) return false;

    await prisma.userSubscription.upsert({
      where: { user_id: userId },
      update: {
        version_slug: versionSlug,
        status,
        expires_at: expiresAt,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        version_slug: versionSlug,
        status,
        started_at: new Date(),
        expires_at: expiresAt,
      },
    });

    return true;
  } catch (error) {
    console.error("Error updating user subscription:", error);
    return false;
  }
}

// Get usage statistics for a user
export async function getUserUsageStats(userId?: string, sessionId?: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const where = userId ? { user_id: userId } : { session_id: sessionId };

    const [todayUsage, monthUsage, totalUsage] = await Promise.all([
      prisma.storyUsageAnalytics.count({
        where: { ...where, created_at: { gte: today }, success: true },
      }),
      prisma.storyUsageAnalytics.count({
        where: { ...where, created_at: { gte: thisMonth }, success: true },
      }),
      prisma.storyUsageAnalytics.count({
        where: { ...where, success: true },
      }),
    ]);

    const versionSlug = await getUserVersion(userId, sessionId);
    const version = getVersionBySlug(versionSlug);

    return {
      today: todayUsage,
      thisMonth: monthUsage,
      total: totalUsage,
      dailyLimit: version?.maxStoriesPerDay,
      remainingToday: version?.maxStoriesPerDay
        ? Math.max(0, version.maxStoriesPerDay - todayUsage)
        : null,
      version: versionSlug,
    };
  } catch (error) {
    console.error("Error getting usage stats:", error);
    return null;
  }
}

// Initialize default versions in database
export async function initializeVersions(): Promise<void> {
  try {
    for (const version of storyVersions) {
      await prisma.storyVersion.upsert({
        where: { slug: version.slug },
        update: {
          name: version.name,
          description: version.description,
          icon: version.icon,
          color_scheme: version.colorScheme,
          features: version.features as any,
          limitations: version.limitations as any,
          is_free: version.isFree,
          price_monthly: version.priceMonthly,
          price_yearly: version.priceYearly,
          max_stories_per_day: version.maxStoriesPerDay,
          max_word_count: version.maxWordCount,
          available_templates: version.availableTemplates,
          available_languages: version.availableLanguages,
          advanced_features: version.advancedFeatures as any,
          is_active: version.isActive,
          is_beta: version.isBeta,
          updated_at: new Date(),
        },
        create: {
          name: version.name,
          slug: version.slug,
          description: version.description,
          icon: version.icon,
          color_scheme: version.colorScheme,
          features: version.features as any,
          limitations: version.limitations as any,
          is_free: version.isFree,
          price_monthly: version.priceMonthly,
          price_yearly: version.priceYearly,
          max_stories_per_day: version.maxStoriesPerDay,
          max_word_count: version.maxWordCount,
          available_templates: version.availableTemplates,
          available_languages: version.availableLanguages,
          advanced_features: version.advancedFeatures as any,
          is_active: version.isActive,
          is_beta: version.isBeta,
        },
      });
    }

    console.log("Story versions initialized successfully");
  } catch (error) {
    console.error("Error initializing versions:", error);
  }
}
