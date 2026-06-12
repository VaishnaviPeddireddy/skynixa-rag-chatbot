import { NextRequest, NextResponse } from "next/server";
import {
  getFeedbackStats,
  saveFeedback,
  type FeedbackRating,
} from "@/lib/feedbackStore";

const VALID_RATINGS: FeedbackRating[] = ["understood", "need_more_info"];

/**
 * POST /api/feedback — employee rates whether an answer was helpful.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, question, answer, rating } = body;

    if (!messageId || typeof messageId !== "string") {
      return NextResponse.json(
        { error: "Missing messageId." },
        { status: 400 }
      );
    }

    if (!rating || !VALID_RATINGS.includes(rating)) {
      return NextResponse.json(
        { error: "Rating must be 'understood' or 'need_more_info'." },
        { status: 400 }
      );
    }

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Missing question." },
        { status: 400 }
      );
    }

    const answerPreview =
      typeof answer === "string" ? answer.slice(0, 300) : "";

    const entry = await saveFeedback({
      messageId,
      question: question.trim(),
      answerPreview,
      rating,
    });

    return NextResponse.json({
      message: "Thank you for your feedback.",
      id: entry.id,
    });
  } catch (error) {
    console.error("[/api/feedback] Error:", error);
    return NextResponse.json(
      { error: "Failed to save feedback." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback — summary stats for HR / company admins.
 */
export async function GET() {
  try {
    const stats = await getFeedbackStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[/api/feedback] Error:", error);
    return NextResponse.json(
      { error: "Failed to load feedback stats." },
      { status: 500 }
    );
  }
}
