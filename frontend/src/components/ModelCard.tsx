"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import Markdown from "react-markdown";
import type { ModelResponse } from "@/utils/api";
import IdiomCard from "./IdiomCard";

interface ModelCardProps {
  response: ModelResponse;
  isAgreed?: boolean;
}

// Color mappings by provider (matches any model from that provider)
function getModelColors(modelName: string): { bg: string; border: string; text: string } {
  const name = modelName.toLowerCase();

  // OpenAI models
  if (name.includes("gpt") || name.includes("o1") || name.includes("openai")) {
    return {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    };
  }

  // Anthropic models
  if (name.includes("claude")) {
    return {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
    };
  }

  // Google models
  if (name.includes("gemini")) {
    return {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    };
  }

  return {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
  };
}

export default function ModelCard({ response, isAgreed }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const colors = getModelColors(response.model_name);
  const hasError = response.content.startsWith("Error:");

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden`}>
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${colors.text}`}>
            {response.model_name}
          </h3>
          {!hasError && (
            isAgreed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-white p-4">
          {hasError ? (
            <p className="text-red-600">{response.content}</p>
          ) : (
            <>
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:marker:text-gray-400">
                <Markdown>{response.content}</Markdown>
              </div>

              {response.idiom_analysis?.idioms && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-medium text-gray-900">Idioms Found:</h4>
                  {response.idiom_analysis.idioms.map((idiom, idx) => (
                    <IdiomCard key={idx} idiom={idiom} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
