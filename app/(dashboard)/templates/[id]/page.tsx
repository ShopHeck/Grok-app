import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { agentMap } from "@/lib/agents";
import {
  ArrowLeft,
  Star,
  Users,
  GitFork,
  Clock,
  Copy,
  Play,
  Sparkles,
} from "lucide-react";
import { TemplateActions } from "@/components/templates/template-actions";
import type { Metadata } from "next";

// Use service role client to bypass RLS — templates are public but owned by admin
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = getServiceClient();
  const { data: template } = await supabase
    .from("templates")
    .select("title, description, agent_id")
    .eq("id", id)
    .single();

  if (!template) return { title: "Template Not Found" };

  const agent = agentMap[template.agent_id];
  return {
    title: `${template.title} — ${agent?.name || "Template"} | WriteScore`,
    description: template.description,
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServiceClient();

  const { data: template, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[templates/[id]] Query failed:", error.message);
  }

  if (!template) notFound();

  const agent = agentMap[template.agent_id];
  const authorName = template.is_official ? "WriteScore" : "Community";

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/templates"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Templates
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{agent?.icon || "✨"}</span>
            {template.is_official && (
              <Badge variant="default" className="text-xs bg-primary">
                Official
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {agent?.name || template.agent_id}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mb-2">{template.title}</h1>
          <p className="text-muted-foreground">{template.description}</p>
        </div>

        {/* Score badge */}
        {template.score && (
          <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-muted/50 border">
            <span className="text-3xl font-bold text-primary">
              {template.score}
            </span>
            <span className="text-xs text-muted-foreground">/100 score</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {template.uses_count.toLocaleString()} uses
        </span>
        <span className="flex items-center gap-1.5">
          <GitFork className="h-4 w-4" />
          {template.forks_count} forks
        </span>
        {template.rating > 0 && (
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {template.rating} ({template.rating_count} ratings)
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {new Date(template.created_at).toLocaleDateString()}
        </span>
        <span className="ml-auto text-xs">by {authorName as string}</span>
      </div>

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Template content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Template Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 rounded-lg p-4 border font-mono overflow-x-auto">
            {template.content}
          </pre>
        </CardContent>
      </Card>

      {/* Actions */}
      <TemplateActions
        templateId={template.id}
        agentId={template.agent_id}
        content={template.content}
        title={template.title}
      />
    </div>
  );
}
