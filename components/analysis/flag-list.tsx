"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface Flag {
  severity: "info" | "warning" | "critical";
  message: string;
  context?: string;
}

interface FlagListProps {
  flags: Flag[];
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    label: "Warning",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    label: "Info",
  },
};

export function FlagList({ flags }: FlagListProps) {
  if (!flags || flags.length === 0) return null;

  // Sort by severity: critical first, then warning, then info
  const sorted = [...flags].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
  });

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((flag, i) => {
        const config = severityConfig[flag.severity] || severityConfig.info;
        const Icon = config.icon;

        return (
          <div
            key={i}
            className={cn(
              "flex gap-3 p-3 rounded-lg border",
              config.bg,
              config.border
            )}
          >
            <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconColor)} />
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{flag.message}</p>
              {flag.context && (
                <p className="text-xs text-muted-foreground italic truncate">
                  &ldquo;{flag.context}&rdquo;
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
