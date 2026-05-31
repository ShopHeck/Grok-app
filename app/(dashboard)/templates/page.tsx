import type { Metadata } from "next";
import { TemplateMarketplace } from "@/components/templates/template-marketplace";

export const metadata: Metadata = {
  title: "Templates — AgentDesk",
  description: "Browse high-scoring templates from the community. Use, fork, and customize.",
};

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <TemplateMarketplace />
    </div>
  );
}
