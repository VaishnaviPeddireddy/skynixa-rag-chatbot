"use client";

interface SourceCardProps {
  fileName: string;
  excerpt: string;
  type?: "document" | "web";
  url?: string;
}

function fileExtension(name: string, type?: "document" | "web"): string {
  if (type === "web") return "WEB";
  const ext = name.split(".").pop()?.toUpperCase();
  return ext || "DOC";
}

export default function SourceCard({
  fileName,
  excerpt,
  type = "document",
  url,
}: SourceCardProps) {
  const ext = fileExtension(fileName, type);
  const isWeb = type === "web";

  return (
    <div className="group rounded-xl border border-white/10 bg-slate-900/60 p-3 transition hover:border-skynixa-500/30 hover:bg-slate-900/80">
      <div className="mb-2 flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isWeb ? "bg-indigo-500/15 text-indigo-400" : "bg-skynixa-500/15 text-skynixa-400"
          }`}
        >
          {isWeb ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.105.228-2.156.634-3.11"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {isWeb && url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-medium text-indigo-300 hover:text-indigo-200 hover:underline"
            >
              {fileName}
            </a>
          ) : (
            <p className="truncate text-sm font-medium text-slate-200">
              {fileName}
            </p>
          )}
          <span
            className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              isWeb
                ? "bg-indigo-500/20 text-indigo-300"
                : "bg-skynixa-500/20 text-skynixa-300"
            }`}
          >
            {ext}
          </span>
        </div>
      </div>
      <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
        {excerpt}
      </p>
    </div>
  );
}
