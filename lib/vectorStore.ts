import path from "path";
import fs from "fs/promises";
import { Document } from "@langchain/core/documents";
import { createEmbeddings, DEFAULT_HF_MODEL } from "./embeddings";

/** Directory for the lightweight JSON vector index */
export const VECTOR_STORE_DIR = path.join(process.cwd(), "data", "chroma");

const INDEX_PATH = path.join(VECTOR_STORE_DIR, "index.json");

interface StoredChunk {
  pageContent: string;
  metadata: Record<string, unknown>;
  embedding: number[];
}

interface VectorIndex {
  version: 1;
  model: string;
  entries: StoredChunk[];
}

async function loadIndex(): Promise<VectorIndex> {
  try {
    const raw = await fs.readFile(INDEX_PATH, "utf-8");
    return JSON.parse(raw) as VectorIndex;
  } catch {
    return {
      version: 1,
      model: process.env.HF_EMBEDDING_MODEL || DEFAULT_HF_MODEL,
      entries: [],
    };
  }
}

async function saveIndex(index: VectorIndex): Promise<void> {
  await fs.mkdir(VECTOR_STORE_DIR, { recursive: true });
  await fs.writeFile(INDEX_PATH, JSON.stringify(index), "utf-8");
}

/** Cosine similarity for L2-normalized vectors (dot product). */
function cosineSimilarity(a: number[], b: number[]): number {
  let score = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    score += a[i] * b[i];
  }
  return score;
}

/**
 * Add chunks to the vector store.
 * Embeds one chunk at a time to keep peak RAM low on small machines.
 */
export async function addDocumentsToStore(
  chunks: Document[],
  options?: { replace?: boolean }
): Promise<{ added: number }> {
  if (chunks.length === 0) {
    return { added: 0 };
  }

  const embeddings = createEmbeddings();
  const index = options?.replace
    ? {
        version: 1 as const,
        model: process.env.HF_EMBEDDING_MODEL || DEFAULT_HF_MODEL,
        entries: [] as StoredChunk[],
      }
    : await loadIndex();

  for (const chunk of chunks) {
    const [vector] = await embeddings.embedDocuments([chunk.pageContent]);
    index.entries.push({
      pageContent: chunk.pageContent,
      metadata: chunk.metadata ?? {},
      embedding: vector,
    });
  }

  await saveIndex(index);
  return { added: chunks.length };
}

/** Remove the on-disk index (used before full re-index). */
export async function clearVectorStore(): Promise<void> {
  try {
    await fs.unlink(INDEX_PATH);
  } catch {
    // Index may not exist yet
  }
}

/**
 * Similarity search: embed the query, score stored chunks, return top-K.
 */
export async function similaritySearch(
  query: string,
  topK?: number
): Promise<Document[]> {
  const k = topK ?? parseInt(process.env.RAG_TOP_K || "2", 10);
  const index = await loadIndex();

  if (index.entries.length === 0) {
    return [];
  }

  const embeddings = createEmbeddings();
  const queryVector = await embeddings.embedQuery(query.trim());

  const ranked = index.entries
    .map((entry) => ({
      entry,
      score: cosineSimilarity(queryVector, entry.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return ranked.map(({ entry }) =>
    new Document({
      pageContent: entry.pageContent,
      metadata: entry.metadata,
    })
  );
}
