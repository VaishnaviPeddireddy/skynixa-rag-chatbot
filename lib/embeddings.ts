import path from "path";
import type { Embeddings } from "@langchain/core/embeddings";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { isLightweightMode } from "./aiProvider";

/** ~17 MB quantized — smallest practical text embedding model for RAG */
export const DEFAULT_HF_MODEL = "Xenova/paraphrase-MiniLM-L3-v2";

type FeatureExtractor = (
  text: string,
  options: { pooling: "mean"; normalize: boolean }
) => Promise<{ data: Float32Array | number[] }>;

let extractorPromise: Promise<FeatureExtractor> | null = null;

/**
 * Lazy-load a single shared embedding pipeline to avoid reloading the model.
 */
async function getExtractor(): Promise<FeatureExtractor> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline, env } = await import("@xenova/transformers");

      env.cacheDir = path.join(process.cwd(), "data", "models");
      env.allowLocalModels = true;
      env.useBrowserCache = false;

      // Keep RAM usage low on laptops
      if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.numThreads = 1;
      }

      const model = process.env.HF_EMBEDDING_MODEL || DEFAULT_HF_MODEL;
      return pipeline("feature-extraction", model, {
        quantized: true,
      }) as Promise<FeatureExtractor>;
    })();
  }

  return extractorPromise;
}

async function embedText(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

/** Lightweight embeddings — one chunk at a time to limit peak RAM during ingest */
class LightweightEmbeddings implements Embeddings {
  async embedDocuments(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    for (const text of texts) {
      vectors.push(await embedText(text));
    }
    return vectors;
  }

  async embedQuery(text: string): Promise<number[]> {
    return embedText(text);
  }
}

/**
 * Create embeddings based on AI_PROVIDER.
 * Default: tiny Hugging Face model in Node (~17 MB), no Ollama, no native C++ builds.
 */
export function createEmbeddings(): Embeddings {
  if (isLightweightMode()) {
    return new LightweightEmbeddings();
  }

  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";

  return new OllamaEmbeddings({
    baseUrl,
    model,
  });
}

/**
 * Quick health check for the active embedding provider.
 */
export async function checkEmbeddingsHealth(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    const embeddings = createEmbeddings();
    await embeddings.embedQuery("health check");

    if (isLightweightMode()) {
      return {
        ok: true,
        message: `Lightweight embeddings ready (${process.env.HF_EMBEDDING_MODEL || DEFAULT_HF_MODEL}).`,
      };
    }

    return { ok: true, message: "Ollama embeddings are ready." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown embedding error";

    if (isLightweightMode()) {
      return {
        ok: false,
        message: `Lightweight embeddings failed: ${message}. Run npm install and npm run ingest.`,
      };
    }

    return {
      ok: false,
      message: `Ollama embeddings unavailable: ${message}. Start Ollama or set AI_PROVIDER=lightweight in .env.local`,
    };
  }
}
