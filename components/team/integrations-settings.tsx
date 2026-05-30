"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Copy, Check, Eye, EyeOff, Plus, Trash2, RefreshCw, Loader2,
} from "lucide-react";


interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function IntegrationsSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const res = await fetch("/api/integrations/keys");
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.keys || []);
        setSlackConnected(data.slackConnected || false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/integrations/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedKey(data.key);
        setNewKeyName("");
        loadKeys();
      }
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(keyId: string) {
    await fetch("/api/integrations/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyId }),
    });
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
  }

  async function copyKey() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Slack Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SlackIcon />
            Slack Integration
          </CardTitle>
          <CardDescription>
            Use <code className="text-xs bg-muted px-1 rounded">/agentdesk</code> to score text in any channel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slackConnected ? (
            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-emerald-600">Connected</Badge>
              <span className="text-sm text-muted-foreground">
                Your Slack workspace is connected
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Connect Slack to analyze emails, posts, and docs directly from any channel.
              </p>
              <Button className="w-fit gap-2">
                <SlackIcon /> Add to Slack
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zapier / Webhook API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <WebhookIcon />
            Webhook API (Zapier / Make)
          </CardTitle>
          <CardDescription>
            Connect AgentDesk to 5000+ apps via API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Created key display */}
          {createdKey && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                ⚠️ Copy this key now — it won't be shown again
              </p>
              <div className="flex items-center gap-2">
                <Input readOnly value={createdKey} className="font-mono text-xs" />
                <Button size="sm" variant="outline" onClick={copyKey}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          )}

          {/* Create new key */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="text-xs">New API Key Name</Label>
              <Input
                placeholder="e.g., Zapier Production"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={createKey} disabled={creating || !newKeyName.trim()} className="gap-1.5">
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Create
            </Button>
          </div>

          {/* Existing keys */}
          {apiKeys.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Label className="text-xs text-muted-foreground">Active Keys</Label>
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{key.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {key.keyPreview}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {key.lastUsedAt ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Never used"}
                    </span>
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => revokeKey(key.id)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* API docs link */}
          <p className="text-xs text-muted-foreground pt-2">
            Endpoint: <code className="bg-muted px-1 rounded">POST /api/integrations/webhook</code>
            {" • "}
            <a href="/api/integrations/webhook" className="text-primary hover:underline">
              View API docs →
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SlackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
      <path d="M15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" fill="#ECB22E"/>
    </svg>
  );
}

function WebhookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M18 16.98h1.97c1.13 0 2.03-.92 2.03-2.06v0c0-1.14-.9-2.06-2.03-2.06H18" />
      <path d="M6 16.98H4.03C2.9 16.98 2 16.06 2 14.92v0c0-1.14.9-2.06 2.03-2.06H6" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
