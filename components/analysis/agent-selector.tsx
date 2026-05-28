"use client";

import { agents } from "@/lib/agents";
import { AgentConfig } from "@/lib/agents/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface AgentSelectorProps {
  selectedAgent: string | null;
  onSelect: (agent: AgentConfig) => void;
  userPlan: string;
}

export function AgentSelector({
  selectedAgent,
  onSelect,
  userPlan,
}: AgentSelectorProps) {
  const tierOrder: Record<string, number> = { free: 0, pro: 1, team: 2 };
  const userTier = tierOrder[userPlan] ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => {
        const isLocked = tierOrder[agent.tier] > userTier;
        const isSelected = selectedAgent === agent.id;

        return (
          <button
            key={agent.id}
            type="button"
            onClick={() => !isLocked && onSelect(agent)}
            disabled={isLocked}
            className={cn(
              "relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all duration-200",
              "hover:shadow-md hover:border-primary/50",
              isSelected &&
                "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20",
              !isSelected && !isLocked && "border-border bg-card",
              isLocked &&
                "border-border/50 bg-muted/30 opacity-60 cursor-not-allowed hover:shadow-none hover:border-border/50"
            )}
          >
            {/* Agent icon and tier badge */}
            <div className="flex w-full items-center justify-between">
              <span className="text-3xl">{agent.icon}</span>
              <div className="flex items-center gap-2">
                {agent.tier !== "free" && (
                  <Badge
                    variant={isLocked ? "outline" : "secondary"}
                    className="text-[10px] uppercase tracking-wider"
                  >
                    {agent.tier}
                  </Badge>
                )}
                {isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </div>

            {/* Agent name */}
            <h3 className="font-semibold text-base leading-tight">
              {agent.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {agent.description}
            </p>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
