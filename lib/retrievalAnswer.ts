import { Document } from "@langchain/core/documents";
import type { WebSearchResult } from "./googleSearch";

/**
 * Build a readable answer from company docs and optional web search results.
 * No LLM required — works on low-RAM machines.
 */
export function buildRetrievalAnswer(
  question: string,
  docs: Document[],
  webResults: WebSearchResult[] = []
): string {
  const hasDocs = docs.length > 0;
  const hasWeb = webResults.length > 0;

  if (!hasDocs && !hasWeb) {
    return "I could not find relevant information in company resources or approved external sources.";
  }

  const sections: string[] = [];

  if (hasDocs) {
    const topDoc = docs[0];
    const primarySource =
      (topDoc.metadata?.source as string) || "company documents";

    const uniqueParts: string[] = [];
    const seen = new Set<string>();

    for (const doc of docs) {
      const text = doc.pageContent.trim().replace(/\s+/g, " ");
      if (!text || seen.has(text)) continue;
      seen.add(text);
      uniqueParts.push(text);
    }

    const body = uniqueParts.join(" ").trim();
    const trimmed = body.length > 500 ? body.slice(0, 500).trim() + "…" : body;

    sections.push(
      `From SkyNixa company resources (primarily ${primarySource}):\n${trimmed}`
    );
  }

  if (hasWeb) {
    const webParts = webResults.map(
      (r, i) => `[${i + 1}] ${r.snippet.trim()} (Source: ${r.title})`
    );
    sections.push(
      `From approved external sources (Google):\n${webParts.join("\n")}`
    );
  }

  const intro = hasDocs
    ? "Here is what I found regarding your question:\n\n"
    : "I could not find this in our internal resources, but here is related information from approved external sources:\n\n";

  return (
    intro +
    sections.join("\n\n") +
    "\n\nSee the source cards below for references."
  );
}
