/**
 * lib/tiktok.ts
 *
 * Build-time TikTok thumbnail fetcher.
 *
 * Uses TikTok's PUBLIC oEmbed endpoint — no API key or auth required.
 * This code runs exclusively at build time (Next.js Server Component),
 * so the thumbnail URLs are baked into the static HTML output.
 *
 * To refresh thumbnails, run `npm run build` again, or set up GitHub Actions
 * to auto-rebuild on a schedule (see .github/workflows/deploy.yml for an example).
 */

interface TikTokOembedResponse {
  thumbnail_url?: string;
  title?: string;
  author_name?: string;
  author_url?: string;
  width?: number;
  height?: number;
}

/**
 * Given an array of public TikTok video URLs, return an array of thumbnail URLs.
 * Failures (private video, bad URL, network error) silently return an empty string
 * for that slot so the card degrades gracefully to the stacked placeholder.
 *
 * @param videoUrls  e.g. ["https://www.tiktok.com/@sarah.rh.bashir/video/7123456789"]
 * @returns          Parallel array of thumbnail URLs (empty string on failure)
 */
export async function fetchTikTokThumbnails(
  videoUrls: string[]
): Promise<string[]> {
  if (!videoUrls || videoUrls.length === 0) return [];

  const results = await Promise.allSettled(
    videoUrls.map(async (url) => {
      if (!url || !url.includes("tiktok.com")) return "";

      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;

      const res = await fetch(oembedUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; next-links/1.0)" },
      });

      if (!res.ok) {
        console.warn(`[next-links] TikTok oEmbed failed (${res.status}) for: ${url}`);
        return "";
      }

      const data: TikTokOembedResponse = await res.json();
      return data.thumbnail_url ?? "";
    })
  );

  return results.map((r) => (r.status === "fulfilled" ? r.value : ""));
}
