"use client";

import type { ModelResponse } from "@/utils/api";
import ModelCard from "./ModelCard";

interface AnalysisGridProps {
  responses: ModelResponse[];
  isLoading: boolean;
}

export default function AnalysisGrid({ responses, isLoading }: AnalysisGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border-2 border-gray-200 bg-gray-50 p-6"
          >
            <div className="h-4 w-24 rounded bg-gray-300" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-5/6 rounded bg-gray-200" />
              <div className="h-3 w-4/6 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (responses.length === 0) {
    return null;
  }

  // Check if all models agree (simplified: check if contents are similar in length)
  // In production, you'd want more sophisticated comparison
  const validResponses = responses.filter((r) => !r.content.startsWith("Error:"));
  const allAgree = validResponses.length === 3;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
        {allAgree && (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
            All models responded successfully
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {responses.map((response, idx) => (
          <ModelCard
            key={idx}
            response={response}
            isAgreed={!response.content.startsWith("Error:")}
          />
        ))}
      </div>
    </div>
  );
}
