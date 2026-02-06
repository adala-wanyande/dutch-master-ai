"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { UploadZone, TaskSelector, ModelTierSelector, AnalysisGrid } from "@/components";
import { analyzeHomework, type ModelResponse, type TaskType, type ModelTier } from "@/utils/api";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [taskType, setTaskType] = useState<TaskType>("tekst");
  const [modelTier, setModelTier] = useState<ModelTier>("pro");
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setResponses([]);

    try {
      const results = await analyzeHomework(selectedFile, taskType, modelTier);
      setResponses(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setResponses([]);
    setError(null);
  };

  const tierLabels: Record<ModelTier, string> = {
    thinking: "Thinking Models",
    pro: "Pro Models",
    fast: "Fast Models",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🇳🇱</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DutchMaster AI</h1>
              <p className="text-sm text-gray-500">
                Your polyglot homework helper
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-8">
          {/* Step 1: Select Task Type */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              1. What type of homework is this?
            </h2>
            <TaskSelector selected={taskType} onSelect={setTaskType} />
          </section>

          {/* Step 2: Select Model Tier */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              2. Choose AI model tier
            </h2>
            <ModelTierSelector selected={modelTier} onSelect={setModelTier} />
          </section>

          {/* Step 3: Upload Image */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              3. Upload your homework image
            </h2>
            <UploadZone
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              onClear={handleClear}
            />
          </section>

          {/* Step 4: Analyze */}
          <section className="flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing with {tierLabels[modelTier]}...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Analyze Homework
                </>
              )}
            </button>
          </section>

          {/* Error Display */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Step 5: Results */}
          <section>
            <AnalysisGrid responses={responses} isLoading={isLoading} />
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
          <p>
            Powered by OpenAI, Anthropic, and Google AI
          </p>
        </div>
      </footer>
    </div>
  );
}
