import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { similaritySearch } from "./vectorStore";
import { isLightweightMode } from "./aiProvider";
import { buildRetrievalAnswer } from "./retrievalAnswer";
import {
  isGoogleSearchEnabled,
  searchGoogle,
  type WebSearchResult,
} from "./googleSearch";

/** Shape of a source citation returned to the UI */
export interface SourceReference {
  fileName: string;
  excerpt: string;
  type?: "document" | "web";
  url?: string;
}

/** Full RAG response including answer and sources */
export interface RAGResponse {
  answer: string;
  sources: SourceReference[];
  mode: "lightweight" | "ollama";
  usedGoogleSearch?: boolean;
}

const SYSTEM_PROMPT = `You are the SkyNixa Company Info Assistant — a helpful internal chatbot for employees.

Your job is to answer questions about SkyNixa as a company: teams, culture, HR, IT, benefits, onboarding, office locations, tools, and day-to-day employee topics.

Rules:
- Answer using the context provided below (company documents and/or web search results).
- Prefer company document information over web results when both are available.
- Do not invent information.
- If the context does not contain enough information, say: "I could not find that information in our company resources. Please contact HR or IT for help."
- Be clear, concise, and professional.
- When relevant, mention which area the answer comes from (HR, IT, benefits, onboarding, web, etc.).`;

function buildUserPrompt(
  context: string,
  question: string,
  webResults: WebSearchResult[]
): string {
  let prompt = `CONTEXT FROM COMPANY DOCUMENTS:
---
${context || "(No matching company documents found)"}
---`;

  if (webResults.length > 0) {
    prompt += `

CONTEXT FROM APPROVED EXTERNAL WEB SEARCH:
---
${webResults
  .map(
    (r, i) =>
      `[Web ${i + 1}: ${r.title}]\nURL: ${r.link}\n${r.snippet}`
  )
  .join("\n\n")}
---`;
  }

  prompt += `

EMPLOYEE QUESTION: ${question}

Please provide a helpful answer based on the context above. Prefer company documents when available.`;

  return prompt;
}

function createChatModel(): ChatOllama {
  return new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "phi3",
    temperature: 0.2,
  });
}

function buildDocumentSources(
  docs: Awaited<ReturnType<typeof similaritySearch>>
): SourceReference[] {
  const seen = new Set<string>();
  const sources: SourceReference[] = [];

  for (const doc of docs) {
    const fileName = (doc.metadata?.source as string) || "unknown";
    if (seen.has(fileName)) continue;
    seen.add(fileName);

    sources.push({
      fileName,
      excerpt: doc.pageContent.slice(0, 200).trim() + "...",
      type: "document",
    });
  }

  return sources;
}

function buildWebSources(webResults: WebSearchResult[]): SourceReference[] {
  return webResults.map((result) => ({
    fileName: result.title,
    excerpt: result.snippet,
    type: "web" as const,
    url: result.link,
  }));
}

async function fetchWebResults(question: string): Promise<WebSearchResult[]> {
  if (!isGoogleSearchEnabled()) {
    return [];
  }

  const maxResults = parseInt(process.env.GOOGLE_SEARCH_MAX_RESULTS || "2", 10);

  try {
    return await searchGoogle(question.trim(), maxResults);
  } catch (error) {
    console.error("[Google Search]", error);
    return [];
  }
}

async function generateOllamaAnswer(
  context: string,
  question: string,
  webResults: WebSearchResult[]
): Promise<string> {
  const chatModel = createChatModel();
  const response = await chatModel.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(buildUserPrompt(context, question, webResults)),
  ]);

  return typeof response.content === "string"
    ? response.content
    : String(response.content);
}

/**
 * Run the RAG pipeline.
 * Lightweight mode: retrieve from company docs + optional Google search.
 * Ollama mode: retrieve + optional Google + local LLM generation.
 */
export async function runRAGPipeline(question: string): Promise<RAGResponse> {
  if (!question.trim()) {
    throw new Error("Please enter a question.");
  }

  const mode = isLightweightMode() ? "lightweight" : "ollama";
  const trimmedQuestion = question.trim();

  const [relevantDocs, webResults] = await Promise.all([
    similaritySearch(trimmedQuestion),
    fetchWebResults(trimmedQuestion),
  ]);

  const usedGoogleSearch = webResults.length > 0;

  if (relevantDocs.length === 0 && webResults.length === 0) {
    const hint = isGoogleSearchEnabled()
      ? "Please add company handbooks and guides, then click Refresh Knowledge Base."
      : "Please add company handbooks and guides, then click Refresh Knowledge Base. To also search Google, set ENABLE_GOOGLE_SEARCH=true in .env.local.";

    return {
      answer: `I could not find any relevant information in our company resources.${isGoogleSearchEnabled() ? "" : " External search is not configured yet."} ${hint}`,
      sources: [],
      mode,
      usedGoogleSearch: false,
    };
  }

  const sources = [
    ...buildDocumentSources(relevantDocs),
    ...buildWebSources(webResults),
  ];

  if (isLightweightMode()) {
    return {
      answer: buildRetrievalAnswer(trimmedQuestion, relevantDocs, webResults),
      sources,
      mode,
      usedGoogleSearch,
    };
  }

  const context = relevantDocs
    .map(
      (doc, i) =>
        `[Source ${i + 1}: ${doc.metadata?.source || "document"}]\n${doc.pageContent}`
    )
    .join("\n\n");

  const answer = await generateOllamaAnswer(
    context,
    trimmedQuestion,
    webResults
  );

  return { answer, sources, mode, usedGoogleSearch };
}
