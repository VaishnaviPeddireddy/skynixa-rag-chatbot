import ChatBox from "@/components/ChatBox";
import UploadDocument from "@/components/UploadDocument";
import FeedbackStatsPanel from "@/components/FeedbackStatsPanel";

const COMPANY_QUOTES = [
  {
    text: "Welcome to the team — the best journeys start with the right information.",
    author: "SkyNixa People Team",
  },
  {
    text: "Ask early, ask often. No question is too small when you're getting started.",
    author: "New Hire Guide",
  },
  {
    text: "We're building something great together — and we're here to help you find your way.",
    author: "SkyNixa Leadership",
  },
];

const TOPICS = [
  "Company overview & teams",
  "HR, payroll & time off",
  "IT setup, tools & access",
  "Office locations & working hours",
  "Benefits, perks & culture",
  "New hire onboarding checklist",
];

export default function HomePage() {
  return (
    <main className="relative mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      <header className="relative mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-skynixa-500/30 bg-skynixa-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-skynixa-300">
          <span className="h-1.5 w-1.5 rounded-full bg-skynixa-400 shadow-glow-sm" />
          SkyNixa Internal
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-gradient">Company Info</span>
          <br />
          <span className="text-white">Assistant</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
          Your go-to guide for company information — HR, IT, benefits, culture,
          onboarding, and day-to-day questions for new and existing employees.
        </p>
      </header>

      <div className="relative grid gap-6 lg:grid-cols-5">
        <aside className="space-y-4 lg:col-span-2">
          <UploadDocument />

          <FeedbackStatsPanel />

          <div className="rounded-2xl glass-panel p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">
              What you can ask
            </h3>
            <ul className="space-y-2.5">
              {TOPICS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-slate-400"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-skynixa-500/15 text-[10px] text-skynixa-400">
                    →
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            {COMPANY_QUOTES.map((quote) => (
              <blockquote
                key={quote.author}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
              >
                <p className="text-sm italic leading-relaxed text-slate-400">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <footer className="mt-2 text-xs font-medium text-skynixa-400/80">
                  — {quote.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-3">
          <div className="h-[min(680px,calc(100vh-280px))] min-h-[520px]">
            <ChatBox />
          </div>
        </section>
      </div>

      <footer className="relative mt-10 text-center text-xs leading-relaxed text-slate-600">
        SkyNixa Company Info Assistant — for internal employee use only.
        <br />
        Answers may be generated from company documents, internal resources, and
        other approved external sources.
      </footer>
    </main>
  );
}
