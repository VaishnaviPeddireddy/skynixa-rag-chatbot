/**
 * AI provider configuration.
 *
 * lightweight (default) — small Hugging Face model in Node (~25 MB), no Ollama
 * ollama              — full local LLM via Ollama (needs more RAM)
 */
export type AIProvider = "lightweight" | "ollama";

export function getAIProvider(): AIProvider {
  const value = (process.env.AI_PROVIDER || "lightweight").toLowerCase();
  return value === "ollama" ? "ollama" : "lightweight";
}

export function isLightweightMode(): boolean {
  return getAIProvider() === "lightweight";
}

export function getProviderLabel(): string {
  return isLightweightMode()
    ? "Lightweight RAG (tiny HF embeddings, ~2 GB RAM, no Ollama)"
    : "Ollama (local LLM + embeddings)";
}
