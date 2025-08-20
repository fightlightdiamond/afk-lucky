"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Star, Crown, Building2, Zap } from "lucide-react";
import { storyVersions, StoryVersionConfig } from "@/data/storyVersions";

interface VersionSelectorProps {
  currentVersion?: string;
  showPricing?: boolean;
}

export default function VersionSelector({
  currentVersion,
  showPricing = true,
}: VersionSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const getVersionUrl = (slug: string) => {
    switch (slug) {
      case "simple":
        return "/story";
      case "advanced":
        return "/story/advanced";
      case "pro":
        return "/story/pro";
      case "enterprise":
        return "/story/enterprise";
      default:
        return "/story";
    }
  };

  const getColorClasses = (
    colorScheme: string,
    isSelected: boolean = false
  ) => {
    const colors = {
      blue: {
        bg: isSelected
          ? "bg-blue-50 border-blue-500"
          : "bg-white border-blue-200",
        text: "text-blue-600",
        button: "bg-blue-600 hover:bg-blue-700",
        badge: "bg-blue-100 text-blue-800",
      },
      purple: {
        bg: isSelected
          ? "bg-purple-50 border-purple-500"
          : "bg-white border-purple-200",
        text: "text-purple-600",
        button: "bg-purple-600 hover:bg-purple-700",
        badge: "bg-purple-100 text-purple-800",
      },
      green: {
        bg: isSelected
          ? "bg-green-50 border-green-500"
          : "bg-white border-green-200",
        text: "text-green-600",
        button: "bg-green-600 hover:bg-green-700",
        badge: "bg-green-100 text-green-800",
      },
      gold: {
        bg: isSelected
          ? "bg-yellow-50 border-yellow-500"
          : "bg-white border-yellow-200",
        text: "text-yellow-600",
        button: "bg-yellow-600 hover:bg-yellow-700",
        badge: "bg-yellow-100 text-yellow-800",
      },
    };
    return colors[colorScheme as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Choose Your Story Generator Version
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Chọn phiên bản phù hợp với nhu cầu sử dụng của bạn
        </p>

        {showPricing && (
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span
              className={`text-sm ${
                selectedPeriod === "monthly"
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setSelectedPeriod(
                  selectedPeriod === "monthly" ? "yearly" : "monthly"
                )
              }
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  selectedPeriod === "yearly"
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm ${
                selectedPeriod === "yearly"
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              Yearly
              <span className="ml-1 text-green-600 font-medium">
                (Save 17%)
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Version Cards */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
        {storyVersions.map((version) => {
          const isSelected = currentVersion === version.slug;
          const colors = getColorClasses(version.colorScheme, isSelected);
          const price =
            selectedPeriod === "monthly"
              ? version.priceMonthly
              : version.priceYearly;

          return (
            <div
              key={version.id}
              className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all hover:shadow-xl ${
                colors.bg
              } ${isSelected ? "ring-2 ring-offset-2 ring-purple-500" : ""}`}
            >
              {/* Badges */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {version.isPopular && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </span>
                )}
                {version.isRecommended && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    Recommended
                  </span>
                )}
                {version.isBeta && (
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Beta
                  </span>
                )}
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{version.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {version.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{version.tagline}</p>

                {/* Pricing */}
                <div className="mb-4">
                  {version.isFree ? (
                    <div className="text-3xl font-bold text-gray-800">Free</div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-gray-800">
                        ${price}
                        <span className="text-lg font-normal text-gray-600">
                          /{selectedPeriod === "monthly" ? "mo" : "yr"}
                        </span>
                      </div>
                      {selectedPeriod === "yearly" && version.priceMonthly && (
                        <div className="text-sm text-gray-500">
                          ${(price! / 12).toFixed(2)}/month billed yearly
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {version.features.slice(0, 5).map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check
                      className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {feature.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {feature.description}
                      </div>
                    </div>
                  </div>
                ))}

                {version.features.length > 5 && (
                  <div className="text-sm text-gray-500 text-center pt-2">
                    +{version.features.length - 5} more features
                  </div>
                )}
              </div>

              {/* Limitations */}
              {version.limitations.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Limitations:
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {version.limitations
                      .slice(0, 3)
                      .map((limitation, index) => (
                        <li key={index}>• {limitation}</li>
                      ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <Link
                href={getVersionUrl(version.slug)}
                className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${colors.button} text-white`}
              >
                {isSelected
                  ? "Current Plan"
                  : version.isFree
                  ? "Get Started"
                  : "Upgrade Now"}
              </Link>

              {/* Additional Info */}
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500">
                  {version.maxStoriesPerDay &&
                    `${version.maxStoriesPerDay} stories/day`}
                  {version.maxStoriesPerDay && version.maxWordCount && " • "}
                  {version.maxWordCount && `${version.maxWordCount} words max`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Feature Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-semibold text-gray-800">
                  Features
                </th>
                {storyVersions.map((version) => (
                  <th
                    key={version.id}
                    className="text-center p-4 font-semibold text-gray-800"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl mb-1">{version.icon}</span>
                      <span>{version.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Stories per day */}
              <tr className="border-t">
                <td className="p-4 font-medium text-gray-800">
                  Stories per day
                </td>
                {storyVersions.map((version) => (
                  <td key={version.id} className="text-center p-4">
                    {version.maxStoriesPerDay ? version.maxStoriesPerDay : "∞"}
                  </td>
                ))}
              </tr>

              {/* Max word count */}
              <tr className="border-t bg-gray-50">
                <td className="p-4 font-medium text-gray-800">
                  Max words per story
                </td>
                {storyVersions.map((version) => (
                  <td key={version.id} className="text-center p-4">
                    {version.maxWordCount ? version.maxWordCount : "∞"}
                  </td>
                ))}
              </tr>

              {/* Templates */}
              <tr className="border-t">
                <td className="p-4 font-medium text-gray-800">
                  Available templates
                </td>
                {storyVersions.map((version) => (
                  <td key={version.id} className="text-center p-4">
                    {version.availableTemplates.includes("all")
                      ? "All"
                      : version.availableTemplates.length}
                  </td>
                ))}
              </tr>

              {/* Custom templates */}
              <tr className="border-t bg-gray-50">
                <td className="p-4 font-medium text-gray-800">
                  Custom templates
                </td>
                {storyVersions.map((version) => (
                  <td key={version.id} className="text-center p-4">
                    {version.advancedFeatures.customTemplates ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Analytics */}
              <tr className="border-t">
                <td className="p-4 font-medium text-gray-800">Analytics</td>
                {storyVersions.map((version) => (
                  <td key={version.id} className="text-center p-4">
                    {version.advancedFeatures.analytics ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* API Access */}
              <tr className="border-t bg-gray-50">
                <td className="p-4 font-medium text-gray-800">API Access</td>
                {storyVersions.map((version) => (
                  <td key={version.id} className="text-center p-4">
                    {version.advancedFeatures.apiAccess ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Can I upgrade or downgrade anytime?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes, you can change your plan at any time. Upgrades take effect
              immediately, and downgrades take effect at the end of your current
              billing period.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              What happens to my data if I downgrade?
            </h3>
            <p className="text-gray-600 text-sm">
              Your stories and preferences are always preserved. You'll just
              have access to fewer features based on your new plan.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Is there a free trial for paid plans?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes! All paid plans come with a 7-day free trial. No credit card
              required to start your trial.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Do you offer discounts for students or nonprofits?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes, we offer 50% discounts for students and qualified nonprofit
              organizations. Contact us for more information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
