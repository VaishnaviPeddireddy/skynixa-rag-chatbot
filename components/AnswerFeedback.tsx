"use client";

import { useState } from "react";

type FeedbackRating = "understood" | "need_more_info";

interface AnswerFeedbackProps {
  messageId: string;
  question: string;
  answer: string;
  initialFeedback?: FeedbackRating | null;
  onSubmitted?: (rating: FeedbackRating) => void;
}

export default function AnswerFeedback({
  messageId,
  question,
  answer,
  initialFeedback = null,
  onSubmitted,
}: AnswerFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackRating | null>(
    initialFeedback
  );
  const [submitting, setSubmitting] = useState(false);

  async function submitFeedback(rating: FeedbackRating) {
    if (feedback || submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          question,
          answer,
          rating,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setFeedback(rating);
      onSubmitted?.(rating);
      window.dispatchEvent(new CustomEvent("feedback-submitted"));
    } catch {
      setSubmitting(false);
    }
  }

  if (feedback) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        {feedback === "understood" ? (
          <>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              ✓
            </span>
            <span className="text-emerald-400/90">
              Thanks — glad this helped!
            </span>
          </>
        ) : (
          <>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
              →
            </span>
            <span className="text-amber-400/90">
              Noted — we&apos;ll improve this. Try HR at hr@skynixa.com for more help.
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <p className="mb-2 text-xs text-slate-500">Was this answer helpful?</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => submitFeedback("understood")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          I understand
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => submitFeedback("need_more_info")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:border-amber-500/40 hover:bg-amber-500/20 disabled:opacity-50"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
          Need more information
        </button>
      </div>
    </div>
  );
}
