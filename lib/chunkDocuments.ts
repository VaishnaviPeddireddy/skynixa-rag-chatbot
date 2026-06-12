import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import type { LoadedDocument } from "./documentLoader";

/**
 * Default chunk settings — can be overridden via environment variables.
 */
function getChunkConfig() {
  return {
    chunkSize: parseInt(process.env.CHUNK_SIZE || "400", 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || "50", 10),
  };
}

/**
 * Split loaded documents into smaller chunks for embedding and retrieval.
 * Each chunk carries metadata linking it back to the source file.
 */
export async function chunkDocuments(
  loadedDocs: LoadedDocument[]
): Promise<Document[]> {
  const { chunkSize, chunkOverlap } = getChunkConfig();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    // Split on paragraphs first, then sentences, then words
    separators: ["\n\n", "\n", ". ", " ", ""],
  });

  const allChunks: Document[] = [];

  for (const doc of loadedDocs) {
    const chunks = await splitter.createDocuments(
      [doc.text],
      [
        {
          source: doc.fileName,
          fileType: doc.fileType,
        },
      ]
    );
    allChunks.push(...chunks);
  }

  return allChunks;
}

/**
 * Chunk a single document (used after file upload).
 */
export async function chunkSingleDocument(
  doc: LoadedDocument
): Promise<Document[]> {
  return chunkDocuments([doc]);
}
