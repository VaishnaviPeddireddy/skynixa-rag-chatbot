/**
 * CLI script to ingest all documents in /data/documents into the vector store.
 * Run: npm run ingest
 *
 * Uses a tiny Hugging Face embedding model — no Ollama or C++ build tools needed.
 */
import { config } from "dotenv";
import { ingestAllDocuments } from "../lib/ingestDocument";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  console.log("SkyNixa — ingesting documents from /data/documents ...\n");

  try {
    const result = await ingestAllDocuments();

    if (result.filesProcessed === 0) {
      console.log("No documents found. Add files to data/documents/ first.");
      process.exit(0);
    }

    console.log(
      `Done! Processed ${result.filesProcessed} file(s), added ${result.chunksAdded} chunk(s) to the vector store.`
    );
  } catch (error) {
    console.error("Ingest failed:", error);
    process.exit(1);
  }
}

main();
