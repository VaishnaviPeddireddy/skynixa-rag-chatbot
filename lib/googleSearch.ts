/** A single result from Google Programmable Search */
export interface WebSearchResult {
  title: string;
  link: string;
  snippet: string;
}

/** True when Google search is enabled and API keys are configured */
export function isGoogleSearchEnabled(): boolean {
  return (
    process.env.ENABLE_GOOGLE_SEARCH === "true" &&
    Boolean(process.env.GOOGLE_SEARCH_API_KEY) &&
    Boolean(process.env.GOOGLE_SEARCH_ENGINE_ID)
  );
}

/**
 * Search the web via Google Custom Search JSON API.
 * Requires a Programmable Search Engine: https://programmablesearchengine.google.com
 */
export async function searchGoogle(
  query: string,
  maxResults = 2
): Promise<WebSearchResult[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !engineId) {
    return [];
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", engineId);
  url.searchParams.set("q", query.trim());
  url.searchParams.set("num", String(Math.min(Math.max(maxResults, 1), 10)));

  const response = await fetch(url.toString());

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Google Search failed (${response.status}). Check your API key and Search Engine ID. ${body.slice(0, 120)}`
    );
  }

  const data = (await response.json()) as {
    items?: { title: string; link: string; snippet: string }[];
  };

  return (data.items ?? []).map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
  }));
}
