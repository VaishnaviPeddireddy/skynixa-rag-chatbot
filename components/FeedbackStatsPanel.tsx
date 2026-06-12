"use client";

import { useEffect, useState } from "react";

interface FeedbackStats {
  total: number;
  understood: number;
  needMoreInfo: number;
}

/** Small admin widget — shows how helpful answers are for employees */
export default function FeedbackStatsPanel() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);

  useEffect(() => {
    function loadStats() {
      fetch("/api/feedback")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(() => setStats(null));
    }

    loadStats();
    window.addEventListener("feedback-submitted", loadStats);
    return () => window.removeEventListener("feedback-submitted", loadStats);
  }, []);

  if (!stats || stats.total === 0) {
    return (
      <div className="rounded-2xl glass-panel p-5">
        <h3 className="mb-1 text-sm font-semibold text-white">
          Employee Feedback
        </h3>
        <p className="text-xs text-slate-500">
          Response ratings from employees will appear here.
        </p>
      </div>
    );
  }

  const helpfulPct = Math.round((stats.understood / stats.total) * 100);

  return (
    <div className="rounded-2xl glass-panel p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">
        Employee Feedback
      </h3>
      <div className="mb-3 flex items-end gap-2">
        <span className="text-3xl font-bold text-white">{helpfulPct}%</span>
        <span className="mb-1 text-xs text-slate-400">found answers helpful</span>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            I understand
          </span>
          <span className="font-medium text-emerald-400">{stats.understood}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Need more info
          </span>
          <span className="font-medium text-amber-400">{stats.needMoreInfo}</span>
        </div>
        <div className="border-t border-white/10 pt-2 text-slate-500">
          {stats.total} total responses
        </div>
      </div>
    </div>
  );
}
