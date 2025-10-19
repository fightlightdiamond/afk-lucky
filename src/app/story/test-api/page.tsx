import PythonAPITest from "@/components/story/PythonAPITest";

export default function TestAPIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🧪 Python AI API Integration Test
          </h1>
          <p className="text-gray-600">
            Test the connection and functionality of the Python FastAPI backend
          </p>
        </div>

        <PythonAPITest />
      </div>
    </div>
  );
}

export const metadata = {
  title: "API Integration Test - Lucky Platform",
  description: "Test the Python AI API integration and functionality",
};
