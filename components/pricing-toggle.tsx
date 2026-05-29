"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/lib/agents/types";
import { Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const prices = {
  monthly: { pro: 19, team: 49 },
  annual: { pro: 15.83, team: 40.83 }, // $190/yr and $490/yr
};

export function PricingToggle() {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Toggle */}
      <div className="flex items-center gap-3 bg-muted rounded-full p-1">
        <button
          onClick={() => setInterval("monthly")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            interval === "monthly"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval("annual")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors relative",
            interval === "annual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Annual
          <Badge
            className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0"
            variant="default"
          >
            Save 17%
          </Badge>
        </button>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {/* Free */}
        <div className="p-6 bg-card rounded-xl border border-border flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold">Free</h3>
            <div className="text-3xl font-bold mt-2">
              $0
              <span className="text-base font-normal text-muted-foreground">
                /mo
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Perfect for trying it out
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm flex-1">
            {PLAN_LIMITS.free.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/sign-up">
            <Button variant="outline" className="w-full">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Pro */}
        <div className="p-6 bg-primary text-primary-foreground rounded-xl flex flex-col gap-4 relative shadow-xl scale-[1.02]">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background text-foreground">
            Most Popular
          </Badge>
          <div>
            <h3 className="text-xl font-semibold">Pro</h3>
            <div className="text-3xl font-bold mt-2">
              ${interval === "monthly" ? prices.monthly.pro : prices.annual.pro.toFixed(0)}
              <span className="text-base font-normal opacity-70">
                /mo
              </span>
            </div>
            <p className="text-sm opacity-80 mt-1">
              {interval === "annual" ? (
                <span>$190/year — save $38</span>
              ) : (
                "For professionals & freelancers"
              )}
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm flex-1">
            {PLAN_LIMITS.pro.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/sign-up">
            <Button variant="secondary" className="w-full">
              Start Free Trial
            </Button>
          </Link>
        </div>

        {/* Team */}
        <div className="p-6 bg-card rounded-xl border border-border flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Team</h3>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mt-2">
              ${interval === "monthly" ? prices.monthly.team : prices.annual.team.toFixed(0)}
              <span className="text-base font-normal text-muted-foreground">
                /mo
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {interval === "annual" ? (
                <span>$490/year — save $98</span>
              ) : (
                "For teams & agencies"
              )}
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm flex-1">
            {PLAN_LIMITS.team.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/sign-up">
            <Button variant="outline" className="w-full">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
