"use client";

import { Save, Cloud, CloudOff, User, Users } from "lucide-react";

interface PreferencesStatusProps {
  isSaving: boolean;
  isDefault: boolean;
  userId?: string;
  sessionId?: string;
}

export default function PreferencesStatus({
  isSaving,
  isDefault,
  userId,
  sessionId,
}: PreferencesStatusProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
      <div className="flex items-center space-x-2">
        {userId ? (
          <User className="w-4 h-4 text-blue-600" />
        ) : (
          <Users className="w-4 h-4 text-gray-600" />
        )}
        <span className="text-gray-700">
          {userId ? "Signed in" : "Anonymous session"}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {isSaving ? (
          <>
            <Save className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-blue-600">Saving...</span>
          </>
        ) : isDefault ? (
          <>
            <CloudOff className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500">Default settings</span>
          </>
        ) : (
          <>
            <Cloud className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Preferences saved</span>
          </>
        )}
      </div>
    </div>
  );
}
