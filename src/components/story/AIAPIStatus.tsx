"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

interface APIStatus {
  status: "checking" | "online" | "offline" | "error";
  message: string;
  responseTime?: number;
}

export default function AIAPIStatus() {
  const [apiStatus, setApiStatus] = useState<APIStatus>({
    status: "checking",
    message: "Checking AI API status...",
  });

  const checkAPIStatus = async () => {
    setApiStatus({ status: "checking", message: "Checking AI API status..." });

    try {
      const startTime = Date.now();
      const response = await fetch(
        process.env.NEXT_PUBLIC_AI_API_URL?.replace("/api/v1", "") +
          "/health" || "http://localhost:8000/health"
      );
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        setApiStatus({
          status: "online",
          message: `AI API is online (${responseTime}ms)`,
          responseTime,
        });
      } else {
        setApiStatus({
          status: "offline",
          message: `AI API returned ${response.status}`,
        });
      }
    } catch (error) {
      setApiStatus({
        status: "error",
        message:
          "Cannot connect to AI API. Make sure Python backend is running on port 8000.",
      });
    }
  };

  useEffect(() => {
    checkAPIStatus();
    // Check every 30 seconds
    const interval = setInterval(checkAPIStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (apiStatus.status) {
      case "checking":
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "offline":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = () => {
    switch (apiStatus.status) {
      case "checking":
        return "border-blue-200 bg-blue-50";
      case "online":
        return "border-green-200 bg-green-50";
      case "offline":
        return "border-red-200 bg-red-50";
      case "error":
        return "border-orange-200 bg-orange-50";
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">AI Backend Status</span>
        </div>
        <button
          onClick={checkAPIStatus}
          className="text-xs px-2 py-1 rounded bg-white border hover:bg-gray-50 transition-colors"
          disabled={apiStatus.status === "checking"}
        >
          Refresh
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-1">{apiStatus.message}</p>

      {apiStatus.status === "error" && (
        <div className="mt-2 text-xs text-gray-600">
          <p className="font-medium">To start the AI backend:</p>
          <code className="block mt-1 p-2 bg-gray-100 rounded text-xs">
            cd aiapi && python run.py
          </code>
        </div>
      )}
    </div>
  );
}
