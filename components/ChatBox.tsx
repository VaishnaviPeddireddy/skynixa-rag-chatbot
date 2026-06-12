"use client";

import { useEffect, useRef, useState } from "react";
import SourceCard from "./SourceCard";
import AnswerFeedback from "./AnswerFeedback";

type FeedbackRating = "understood" | "need_more_info";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  question?: string;
  feedback?: FeedbackRating | null;
  sources?: {
    fileName: string;
    excerpt: string;
    type?: "document" | "web";
    url?: string;
  }[];
}

const EXAMPLE_QUESTIONS = [
  "What does SkyNixa do and which teams are there?",
  "Who do I contact for IT support on my first day?",
  "How do I request time off as a new employee?",
  "Where are SkyNixa offices located and what are the working hours?",
];

function newMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function BotAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-skynixa-500 to-indigo-600 shadow-glow-sm">
      <svg
        className="h-4 w-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
      </svg>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-700 ring-1 ring-white/10">
      <svg
        className="h-4 w-4 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in-up">
      <BotAvatar />
      <div className="rounded-2xl rounded-bl-md border border-white/10 bg-slate-800/80 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-skynixa-400 animate-pulse-dot" />
          <span
            className="h-2 w-2 rounded-full bg-skynixa-400 animate-pulse-dot"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-skynixa-400 animate-pulse-dot"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function setMessageFeedback(messageId: string, rating: FeedbackRating) {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback: rating } : msg
      )
    );
  }

  async function sendQuestion(question: string) {
    if (!question.trim() || loading) return;

    const trimmed = question.trim();

    const userMessage: ChatMessage = {
      id: newMessageId(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get an answer.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: newMessageId(),
          role: "assistant",
          content: data.answer,
          question: trimmed,
          sources: data.sources,
          feedback: null,
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendQuestion(input);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl glass-panel">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <BotAvatar />
          <div>
            <h2 className="font-semibold text-white">Company Info Assistant</h2>
            <p className="text-xs text-slate-400">
              Answers from your company knowledge base
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Online</span>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto p-5">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-skynixa-500/20 to-indigo-500/20 ring-1 ring-white/10">
              <svg
                className="h-8 w-8 text-skynixa-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              How can I help you today?
            </h3>
            <p className="mb-6 max-w-md text-sm text-slate-400">
              Ask about the company, your role, HR, IT, benefits, culture, or
              onboarding. Click a question below to try it in chat.
            </p>
            <div className="mx-auto w-full max-w-xl text-left">
              <p className="mb-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Try asking
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {EXAMPLE_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendQuestion(question)}
                    className="flex min-h-[3.25rem] items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm leading-snug text-slate-300 transition hover:border-skynixa-500/40 hover:bg-skynixa-500/10 hover:text-white"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex animate-fade-in-up gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {msg.role === "user" ? <UserAvatar /> : <BotAvatar />}

            <div
              className={`max-w-[80%] ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-md bg-gradient-to-br from-skynixa-600 to-skynixa-700 text-white shadow-glow-sm"
                    : "rounded-bl-md border border-white/10 bg-slate-800/70 text-slate-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.role === "assistant" &&
                  msg.sources &&
                  msg.sources.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
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
                            d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                          />
                        </svg>
                        Sources
                      </p>
                      {msg.sources.map((src) => (
                        <SourceCard
                          key={src.url ?? src.fileName}
                          fileName={src.fileName}
                          excerpt={src.excerpt}
                          type={src.type}
                          url={src.url}
                        />
                      ))}
                    </div>
                  )}

                {msg.role === "assistant" && msg.question && (
                  <AnswerFeedback
                    messageId={msg.id}
                    question={msg.question}
                    answer={msg.content}
                    initialFeedback={msg.feedback}
                    onSubmitted={(rating) => setMessageFeedback(msg.id, rating)}
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div
            className="animate-fade-in-up rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 bg-slate-900/40 p-4"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 p-1.5 transition focus-within:border-skynixa-500/50 focus-within:shadow-glow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the company, HR, IT, benefits, onboarding..."
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-skynixa-600 text-white transition hover:bg-skynixa-500 disabled:opacity-40 disabled:hover:bg-skynixa-600"
            aria-label="Send message"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-600">
          Answers may come from company documents, internal resources, and other
          approved external sources.
        </p>
      </form>
    </div>
  );
}
