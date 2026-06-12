"use client";

import { useRef, useState } from "react";

interface UploadDocumentProps {
  onUploadSuccess?: (message: string) => void;
}

export default function UploadDocument({ onUploadSuccess }: UploadDocumentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleFileUpload(file: File) {
    setUploading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setStatus({ type: "success", message: data.message });
      onUploadSuccess?.(data.message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed.";
      setStatus({ type: "error", message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleReindexAll() {
    setReindexing(true);
    setStatus(null);

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reindex-all" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Re-index failed.");
      }

      setStatus({ type: "success", message: data.message });
      onUploadSuccess?.(data.message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Re-index failed.";
      setStatus({ type: "error", message });
    } finally {
      setReindexing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }

  return (
    <div className="rounded-2xl glass-panel p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-skynixa-500/15 text-skynixa-400">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
        <div>
          <h2 className="font-semibold text-white">Company Resources</h2>
          <p className="text-xs text-slate-400">
            Add handbooks, guides & internal files
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`mb-4 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragOver
            ? "border-skynixa-400 bg-skynixa-500/10"
            : "border-white/10 bg-white/[0.02] hover:border-skynixa-500/40 hover:bg-white/[0.04]"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.markdown"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
        <svg
          className="mx-auto mb-2 h-8 w-8 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <p className="text-sm font-medium text-slate-300">
          {uploading ? "Uploading..." : "Drop a file or click to browse"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Handbooks, guides, PDFs & more · max 10 MB
        </p>
      </div>

      <button
        type="button"
        onClick={handleReindexAll}
        disabled={reindexing || uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-skynixa-500/30 hover:bg-skynixa-500/10 hover:text-white disabled:opacity-50"
      >
        <svg
          className={`h-4 w-4 ${reindexing ? "animate-spin" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
        {reindexing ? "Refreshing..." : "Refresh Knowledge Base"}
      </button>

      {status && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-xs ${
            status.type === "success"
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border border-red-500/20 bg-red-500/10 text-red-400"
          }`}
          role="alert"
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
