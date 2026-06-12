import { NextRequest, NextResponse } from "next/server";
import { runRAGPipeline } from "@/lib/ragPipeline";

/**
 * POST /api/chat
 * Accepts a user question and returns a RAG-generated answer with sources.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = body?.question;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'question' field." },
        { status: 400 }
      );
    }

    const result = await runRAGPipeline(question);

    return NextResponse.json({
      answer: result.answer,
      sources: result.sources,
      mode: result.mode,
    });
  } catch (error) {
    console.error("[/api/chat] Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while generating an answer.";

    if (message.includes("fetch failed") || message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          error:
            "Cannot connect to Ollama. Use AI_PROVIDER=lightweight in .env.local (no Ollama), or start Ollama for full LLM mode.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
