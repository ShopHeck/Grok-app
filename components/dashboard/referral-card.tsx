"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Gift, Loader2, Users } from "lucide-react";

export function ReferralCard() {
  const [code, setCode] = useState<string | null>(null);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadReferral() {
      try {
        const res = await fetch("/api/referrals");
        if (res.ok) {
          const data = await res.json();
          setCode(data.code);
          setTotalReferrals(data.totalReferrals);
        }
      } finally {
        setLoading(false);
      }
    }
    loadReferral();
  }, []);

  async function handleCopy() {
    if (!code) return;
    const url = `${window.location.origin}/sign-up?ref=${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleClaim() {
    if (!claimCode.trim()) return;
    setClaimLoading(true);
    setClaimMessage(null);

    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: claimCode.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setClaimMessage({ type: "success", text: data.message });
        setClaimCode("");
      } else {
        setClaimMessage({ type: "error", text: data.error });
      }
    } finally {
      setClaimLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" /> Referral Program
        </CardTitle>
        <CardDescription>
          Give 5 free analyses, get 5 when they sign up
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Your referral link */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Your Referral Code</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-md px-3 py-2 font-mono text-sm">
              {code}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </>
              )}
            </Button>
          </div>
          {totalReferrals > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {totalReferrals} successful referral{totalReferrals !== 1 ? "s" : ""}
              <Badge variant="secondary" className="text-xs">
                +{totalReferrals * 5} bonus analyses earned
              </Badge>
            </div>
          )}
        </div>

        {/* Claim a code */}
        <div className="flex flex-col gap-2 pt-3 border-t">
          <Label className="text-sm font-medium">Have a referral code?</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter code (e.g., A1B2C3D4)"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
              className="flex-1 font-mono"
              maxLength={8}
            />
            <Button
              size="sm"
              onClick={handleClaim}
              disabled={claimLoading || !claimCode.trim()}
            >
              {claimLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Claim"
              )}
            </Button>
          </div>
          {claimMessage && (
            <p
              className={`text-xs ${claimMessage.type === "success" ? "text-emerald-600" : "text-destructive"}`}
            >
              {claimMessage.text}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
