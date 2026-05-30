"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { agentMap } from "@/lib/agents";
import { TEMPLATE_CATEGORIES, SORT_OPTIONS } from "@/lib/templates";
import {
  Search, Star, GitFork, Users, ArrowRight, Loader2, Sparkles,
} from "lucide-react";


interface TemplateListItem {
  id: string;
  title: string;
  description: string;
  agent_id: string;
  category: string;
  tags: string[];
  uses_count: number;
  forks_count: number;
  rating: number;
  rating_count: number;
  score: number | null;
  is_official: boolean;
  author_name: string;
  created_at: string;
}

interface TemplateMarketplaceProps {
  initialAgentId?: string;
}

export function TemplateMarketplace({ initialAgentId }: TemplateMarketplaceProps) {
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("popular");
  const [agentFilter, setAgentFilter] = useState<string | null>(initialAgentId || null);

  useEffect(() => {
    loadTemplates();
  }, [category, sort, agentFilter]);

  async function loadTemplates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (agentFilter) params.set("agentId", agentFilter);
      if (sort) params.set("sort", sort);
      if (search) params.set("search", search);

      const res = await fetch(`/api/templates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    loadTemplates();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Template Marketplace</h2>
          <p className="text-sm text-muted-foreground">
            High-scoring templates from the community. Use, fork, and customize.
          </p>
        </div>
        <Link href="/analyses/new?tab=templates">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Share Your Template
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-background"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            !category ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
        </button>
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              category === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found. Be the first to share one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template }: { template: TemplateListItem }) {
  const agent = agentMap[template.agent_id];

  return (
    <Card className="flex flex-col hover:shadow-md hover:border-primary/30 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{agent?.icon || "✨"}</span>
            {template.is_official && (
              <Badge variant="default" className="text-[9px] bg-primary">Official</Badge>
            )}
          </div>
          {template.score && (
            <Badge variant="secondary" className="text-xs font-bold">
              {template.score}/100
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm leading-tight line-clamp-2">
          {template.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
          ))}
        </div>
        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-2 border-t">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {template.uses_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3 w-3" /> {template.forks_count}
          </span>
          {template.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {template.rating}
            </span>
          )}
          <span className="ml-auto">by {template.author_name}</span>
        </div>
      </CardContent>
    </Card>
  );
}
