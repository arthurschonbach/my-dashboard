import { NextResponse } from "next/server";

// Revalidate data every hour
export const revalidate = 3600;

export interface GdeltArticle {
  url: string;
  title: string;
  domain: string;
  seendate: string;
}

export async function GET() {
  const GDELT_API_BASE_URL = "https://api.gdeltproject.org/api/v2/doc/doc";

  const domainWeights: Record<string, number> = {
    // United States
    "nytimes.com": 10,
    "washingtonpost.com": 9,
    "reuters.com": 8,
    "apnews.com": 7,

    // United Kingdom
    "bbc.co.uk": 8,
    "theguardian.com": 7,

    // Germany
    "dw.com": 7,

    // France
    "lemonde.fr": 7,

    // International
    "aljazeera.com": 6,
    "economist.com": 7,
  };

  const reputableDomains = Object.keys(domainWeights);

  const domainFilters = reputableDomains
    .map((domain) => `domain:${domain}`)
    .join(" OR ");

  const query = `(${domainFilters}) AND sourcelang:english`;

  const params = new URLSearchParams({
    mode: "artlist",
    format: "json",
    maxrecords: "50",
    sort: "DateDesc", // safer than Relevance
  });

  const finalUrl = `${GDELT_API_BASE_URL}?query=${encodeURIComponent(
    query
  )}&${params.toString()}`;

  try {
    const response = await fetch(finalUrl, {
      next: { revalidate: 900 },
    });

    const contentType = response.headers.get("content-type");
    if (
      !response.ok ||
      !contentType ||
      !contentType.includes("application/json")
    ) {
      const errorText = await response.text();
      console.error(
        "GDELT API Error - Status:",
        response.status,
        "Body:",
        errorText
      );
      throw new Error(`Invalid response from GDELT API: ${errorText}`);
    }

    const data = await response.json();
    const articles: GdeltArticle[] = data.articles || [];

    // Local keyword scoring
    const impactKeywords = [
      // Geopolitical keywords
      "sanctions",
      "diplomacy",
      "treaty",
      "alliance",
      "conflict",
      "war",
      "peace",
      "summit",
      "negotiations",
      "territorial",
      "sovereignty",
      "embargo",
      "military",
      "defense",
      "security",
      "intelligence",
      "espionage",
      "trade war",
      "bilateral",
      "multilateral",
      "nuclear",
      "election",
      "coup",
      "regime",
      "authoritarian",
      "democracy",
      "protest",
      "uprising",
      "refugee",
      "immigration",
      "border",
      "cybersecurity",
      "terrorism",
      // Breaking news and urgency indicators
      "breaking",
      "urgent",
      "crisis",
      "emergency",
      "major",
      "significant",
      "unprecedented",
      "historic",
      "critical",
      "developing",
      "exclusive",
      "investigation",
      "scandal",
      "controversy",
      "breakthrough",
      "milestone",
      "climate change",
    ];

    const keywordRegex = new RegExp(`\\b(${impactKeywords.join("|")})\\b`, "i");

    // Score and sort articles
    const topArticles = articles
      .map((article) => ({
        ...article,
        score:
          (domainWeights[article.domain] || 0) +
          (keywordRegex.test(article.title) ? 5 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5

    return NextResponse.json(topArticles);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("[GDELT API ROUTE ERROR]", errorMessage);

    return NextResponse.json(
      { message: "Failed to fetch data from GDELT", error: errorMessage },
      { status: 500 }
    );
  }
}
