import fs from "fs/promises";
import path from "path";
import { loadDocumentFromFile } from "./documentLoader";
import { chunkSingleDocument } from "./chunkDocuments";
import { addDocumentsToStore, clearVectorStore } from "./vectorStore";

/** Directory where uploaded company documents are stored */
export const DOCUMENTS_DIR = path.join(process.cwd(), "data", "documents");

/**
 * Ensure the documents directory exists.
 */
export async function ensureDocumentsDir(): Promise<void> {
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
}

/**
 * Save an uploaded file buffer to /data/documents and ingest into the vector store.
 */
export async function ingestUploadedFile(
  fileName: string,
  buffer: Buffer
): Promise<{ fileName: string; chunksAdded: number }> {
  await ensureDocumentsDir();

  const safeName = path.basename(fileName);
  const filePath = path.join(DOCUMENTS_DIR, safeName);

  await fs.writeFile(filePath, buffer);

  const loaded = await loadDocumentFromFile(filePath);
  const chunks = await chunkSingleDocument(loaded);
  const { added } = await addDocumentsToStore(chunks);

  return { fileName: safeName, chunksAdded: added };
}

/**
 * Ingest all documents already present in /data/documents.
 */
export async function ingestAllDocuments(): Promise<{
  filesProcessed: number;
  chunksAdded: number;
}> {
  await ensureDocumentsDir();

  const { loadAllDocuments } = await import("./documentLoader");
  const { chunkDocuments } = await import("./chunkDocuments");

  const docs = await loadAllDocuments(DOCUMENTS_DIR);

  if (docs.length === 0) {
    return { filesProcessed: 0, chunksAdded: 0 };
  }

  const chunks = await chunkDocuments(docs);
  await clearVectorStore();
  const { added } = await addDocumentsToStore(chunks, { replace: true });

  return { filesProcessed: docs.length, chunksAdded: added };
}
