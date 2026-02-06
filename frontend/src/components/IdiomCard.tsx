"use client";

import { BookOpen, Lightbulb, History, Tag } from "lucide-react";
import type { IdiomEntry } from "@/utils/api";

interface IdiomCardProps {
  idiom: IdiomEntry;
}

export default function IdiomCard({ idiom }: IdiomCardProps) {
  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <h5 className="font-semibold text-orange-800">&ldquo;{idiom.phrase}&rdquo;</h5>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <BookOpen className="mt-0.5 h-4 w-4 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">Literal: </span>
            <span className="text-gray-600">{idiom.literal}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Lightbulb className="mt-0.5 h-4 w-4 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">Meaning: </span>
            <span className="text-gray-600">{idiom.meaning}</span>
          </div>
        </div>

        {idiom.origin && (
          <div className="flex items-start gap-2">
            <History className="mt-0.5 h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-gray-700">Origin: </span>
              <span className="text-gray-600">{idiom.origin}</span>
            </div>
          </div>
        )}

        {idiom.register && (
          <div className="flex items-start gap-2">
            <Tag className="mt-0.5 h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-gray-700">Register: </span>
              <span className="italic text-gray-600">{idiom.register}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
