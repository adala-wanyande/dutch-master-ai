"use client";

import {
  BookOpen,
  HelpCircle,
  CheckSquare,
  ArrowRightLeft,
  Quote,
  Navigation,
  SpellCheck,
  Library,
  PenTool,
  Mic,
} from "lucide-react";
import type { TaskType } from "@/utils/api";

interface TaskSelectorProps {
  selected: TaskType;
  onSelect: (task: TaskType) => void;
}

const tasks: Array<{
  id: TaskType;
  name: string;
  shortName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "tekst",
    name: "Tekst",
    shortName: "Text",
    description: "Main text analysis, vocabulary, idioms & cultural context",
    icon: BookOpen,
  },
  {
    id: "oefening_1_vragen",
    name: "Oefening 1 - Vragen",
    shortName: "1. Vragen",
    description: "Open-ended comprehension questions based on the text",
    icon: HelpCircle,
  },
  {
    id: "oefening_2_formulering",
    name: "Oefening 2 - Formulering",
    shortName: "2. Formulering",
    description: "Choose the correct formulation (idioms & expressions)",
    icon: CheckSquare,
  },
  {
    id: "oefening_3_woordvolgorde",
    name: "Oefening 3 - Woordvolgorde",
    shortName: "3. Woordvolgorde",
    description: "Word order & sentence structure exercises",
    icon: ArrowRightLeft,
  },
  {
    id: "oefening_4_uitdrukkingen",
    name: "Oefening 4 - Uitdrukkingen",
    shortName: "4. Uitdrukkingen",
    description: "Fill in the correct expression or idiom",
    icon: Quote,
  },
  {
    id: "oefening_5_voorzetsels",
    name: "Oefening 5 - Voorzetsels",
    shortName: "5. Voorzetsels",
    description: "Choose the correct preposition",
    icon: Navigation,
  },
  {
    id: "oefening_6_spelling",
    name: "Oefening 6 - Spelling",
    shortName: "6. Spelling",
    description: "Verb conjugation (OVT/OTT) and spelling rules",
    icon: SpellCheck,
  },
  {
    id: "oefening_7_woordenschat",
    name: "Oefening 7 - Woordenschat",
    shortName: "7. Woordenschat",
    description: "Vocabulary - choose the correct word in context",
    icon: Library,
  },
  {
    id: "oefening_8_opstel",
    name: "Oefening 8 - Opstel",
    shortName: "8. Opstel",
    description: "Essay writing (200-250 words) with model answer",
    icon: PenTool,
  },
  {
    id: "oefening_9_luisteren_spreken",
    name: "Oefening 9 - Luisteren & Spreken",
    shortName: "9. Spreken",
    description: "Prepare a speech or oral presentation",
    icon: Mic,
  },
];

export default function TaskSelector({
  selected,
  onSelect,
}: TaskSelectorProps) {
  return (
    <div className="space-y-3">
      {/* Main Tekst option */}
      <div className="grid grid-cols-1">
        {tasks.slice(0, 1).map((task) => {
          const Icon = task.icon;
          const isSelected = selected === task.id;
          return (
            <button
              key={task.id}
              onClick={() => onSelect(task.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-6 w-6 flex-shrink-0 ${
                    isSelected ? "text-orange-500" : "text-gray-400"
                  }`}
                />
                <div>
                  <h3
                    className={`font-semibold ${
                      isSelected ? "text-orange-700" : "text-gray-700"
                    }`}
                  >
                    {task.name}
                  </h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Oefeningen grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.slice(1).map((task) => {
          const Icon = task.icon;
          const isSelected = selected === task.id;
          return (
            <button
              key={task.id}
              onClick={() => onSelect(task.id)}
              className={`rounded-lg border-2 p-3 text-left transition-all ${
                isSelected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              <div className="flex items-start gap-2">
                <Icon
                  className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                    isSelected ? "text-orange-500" : "text-gray-400"
                  }`}
                />
                <div className="min-w-0">
                  <h3
                    className={`text-sm font-semibold ${
                      isSelected ? "text-orange-700" : "text-gray-700"
                    }`}
                  >
                    {task.shortName}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {task.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
