"use client";

import { Brain, Zap, Sparkles } from "lucide-react";
import type { ModelTier } from "@/utils/api";

interface ModelTierSelectorProps {
  selected: ModelTier;
  onSelect: (tier: ModelTier) => void;
}

const tiers: Array<{
  id: ModelTier;
  name: string;
  description: string;
  models: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    id: "thinking",
    name: "Thinking",
    description: "Deep reasoning for complex analysis",
    models: "o1 / Claude Thinking / Gemini 2.5 Pro",
    icon: Brain,
    color: "purple",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Balanced quality and speed",
    models: "GPT-4o / Claude Sonnet 4 / Gemini 2.5 Pro",
    icon: Sparkles,
    color: "orange",
  },
  {
    id: "fast",
    name: "Fast",
    description: "Quick responses for simple tasks",
    models: "GPT-4o Mini / Claude Haiku / Gemini Flash",
    icon: Zap,
    color: "green",
  },
];

const colorClasses: Record<string, { selected: string; icon: string }> = {
  purple: {
    selected: "border-purple-500 bg-purple-50",
    icon: "text-purple-500",
  },
  orange: {
    selected: "border-orange-500 bg-orange-50",
    icon: "text-orange-500",
  },
  green: {
    selected: "border-green-500 bg-green-50",
    icon: "text-green-500",
  },
};

export default function ModelTierSelector({
  selected,
  onSelect,
}: ModelTierSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {tiers.map((tier) => {
        const Icon = tier.icon;
        const isSelected = selected === tier.id;
        const colors = colorClasses[tier.color];

        return (
          <button
            key={tier.id}
            onClick={() => onSelect(tier.id)}
            className={`flex-1 min-w-[140px] rounded-lg border-2 p-3 text-left transition-all ${
              isSelected
                ? colors.selected
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon
                className={`h-5 w-5 ${
                  isSelected ? colors.icon : "text-gray-400"
                }`}
              />
              <span
                className={`font-semibold ${
                  isSelected ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {tier.name}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{tier.description}</p>
            <p className="mt-1 text-[10px] text-gray-400 font-mono">
              {tier.models}
            </p>
          </button>
        );
      })}
    </div>
  );
}
