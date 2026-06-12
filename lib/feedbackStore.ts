import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type FeedbackRating = "understood" | "need_more_info";

export interface FeedbackEntry {
  id: string;
  messageId: string;
  question: string;
  answerPreview: string;
  rating: FeedbackRating;
  timestamp: string;
}

const FEEDBACK_DIR = path.join(process.cwd(), "data", "feedback");
const FEEDBACK_FILE = path.join(FEEDBACK_DIR, "entries.jsonl");

export async function saveFeedback(entry: {
  messageId: string;
  question: string;
  answerPreview: string;
  rating: FeedbackRating;
}): Promise<FeedbackEntry> {
  await fs.mkdir(FEEDBACK_DIR, { recursive: true });

  const record: FeedbackEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  await fs.appendFile(FEEDBACK_FILE, JSON.stringify(record) + "\n", "utf-8");
  return record;
}

export async function getFeedbackStats(): Promise<{
  total: number;
  understood: number;
  needMoreInfo: number;
}> {
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, "utf-8");
    const lines = raw.trim().split("\n").filter(Boolean);
    let understood = 0;
    let needMoreInfo = 0;

    for (const line of lines) {
      const entry = JSON.parse(line) as FeedbackEntry;
      if (entry.rating === "understood") understood++;
      else needMoreInfo++;
    }

    return { total: lines.length, understood, needMoreInfo };
  } catch {
    return { total: 0, understood: 0, needMoreInfo: 0 };
  }
}
