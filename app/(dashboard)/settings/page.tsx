import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/lib/agents/types";
import { CreditCard, User, BarChart3, CheckCircle } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const plan = profile?.subscription_status || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const isPaid = plan === "pro" || plan === "team";

  // Get usage
  const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data: usage } = await supabase
    .from("usage")
    .select("agent_id, analysis_count, tokens_used")
    .eq("user_id", user.id)
    .eq("period_start", periodStart);

  const totalUsed = (usage || []).reduce(
    (sum, row) => sum + (row.analysis_count || 0),
    0
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and subscription
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Full Name</span>
            <span className="font-medium">
              {profile?.full_name ?? "Not set"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">
              {profile?.email ?? user.email}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Usage This Month
          </CardTitle>
          <CardDescription>
            Resets on the 1st of each month
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Analyses used
            </span>
            <span className="font-medium">
              {totalUsed}
              {limits.maxAnalysesPerMonth > 0
                ? ` / ${limits.maxAnalysesPerMonth}`
                : " (unlimited)"}
            </span>
          </div>
          {limits.maxAnalysesPerMonth > 0 && (
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, (totalUsed / limits.maxAnalysesPerMonth) * 100)}%`,
                }}
              />
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Plan features:</span>{" "}
            {limits.features.join(" · ")}
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Subscription
          </CardTitle>
          <CardDescription>Manage your plan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">{plan} Plan</p>
              <p className="text-sm text-muted-foreground">
                {plan === "free" && "$0/month"}
                {plan === "pro" && "$19/month"}
                {plan === "team" && "$49/month"}
              </p>
            </div>
            <Badge variant={isPaid ? "default" : "secondary"}>
              {plan}
            </Badge>
          </div>

          {/* Plan features */}
          <div className="flex flex-col gap-1.5 pt-2 border-t">
            {limits.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm"
              >
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                {feature}
              </div>
            ))}
          </div>

          {isPaid ? (
            <form action="/api/stripe/portal" method="POST">
              <Button type="submit" variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </form>
          ) : (
            <form action="/api/stripe/checkout" method="POST">
              <Button type="submit" className="w-full">
                Upgrade to Pro - $19/mo
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
