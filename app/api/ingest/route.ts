import { NextRequest, NextResponse } from "next/server";
import { ingestUploadedFile, ingestAllDocuments } from "@/lib/ingestDocument";
import { isSupportedDocument } from "@/lib/documentLoader";

/** Max upload size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * POST /api/ingest
 * Upload a single document (multipart/form-data) OR re-index all docs (JSON body).
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Re-index all existing documents in /data/documents
    if (contentType.includes("application/json")) {
      const body = await request.json();

      if (body?.action === "reindex-all") {
        const result = await ingestAllDocuments();
        return NextResponse.json({
          message: `Indexed ${result.filesProcessed} file(s), ${result.chunksAdded} chunk(s) added.`,
          ...result,
        });
      }

      return NextResponse.json(
        { error: "Unknown JSON action. Use { action: 'reindex-all' }." },
        { status: 400 }
      );
    }

    // Handle file upload via multipart form
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Send a 'file' field in form-data." },
        { status: 400 }
      );
    }

    if (!isSupportedDocument(file.name)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload PDF, TXT, or Markdown." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ingestUploadedFile(file.name, buffer);

    return NextResponse.json({
      message: `Successfully ingested "${result.fileName}" (${result.chunksAdded} chunks).`,
      ...result,
    });
  } catch (error) {
    console.error("[/api/ingest] Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to ingest document.";

    if (message.includes("fetch failed") || message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          error:
            "Embedding service unavailable. Set AI_PROVIDER=lightweight in .env.local to avoid Ollama.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
