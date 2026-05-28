"use client";

import { Lightbulb } from "lucide-react";

interface SuggestionListProps {
  suggestions: string[];
}

export function SuggestionList({ suggestions }: SuggestionListProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {suggestions.map((suggestion, i) => (
        <div
          key={i}
          className="flex gap-3 items-start p-3 rounded-lg bg-primary/5 border border-primary/10"
        >
          <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed">{suggestion}</p>
        </div>
      ))}
    </div>
  );
}
