/**
 * lib/tiktok-api.ts
 *
 * Build-time TikTok API v2 client.
 *
 * When the following env vars are set, fetchTikTokApiData() returns live
 * follower count and recent video cover images fetched at build time.
 * When any env var is missing it returns null and the page falls back to
 * the static values in src/config/links.ts — no code changes required.
 *
 * Required env vars (add as GitHub Actions secrets):
 *   TIKTOK_CLIENT_KEY     — from your TikTok Developer app
 *   TIKTOK_CLIENT_SECRET  — from your TikTok Developer app
 *   TIKTOK_REFRESH_TOKEN  — long-lived token; auto-rotated by the CI workflow
 *
 * Scopes needed on the TikTok app: user.info.basic, video.list
 */

// ── Response shapes ───────────────────────────────────────────────────────────

interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface TikTokUserResponse {
  data?: {
    user?: {
      display_name?: string;
      follower_count?: number;
    };
  };
}

interface TikTokVideoListResponse {
  data?: {
    videos?: Array<{ id: string; cover_image_url: string }>;
  };
}

// ── Public result type ────────────────────────────────────────────────────────

export interface TikTokApiResult {
  displayName: string;
  followerCount: number;
  videoCoverUrls: string[];
}

// ── Internal fetch helpers ────────────────────────────────────────────────────

async function refreshAccessToken(
  clientKey: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TikTok token refresh failed (${res.status}): ${body}`);
  }

  const data: TikTokTokenResponse = await res.json();
  return data.access_token;
}

async function fetchUserInfo(
  accessToken: string
): Promise<{ displayName: string; followerCount: number } | null> {
  const res = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    console.warn(`[next-links] TikTok user info failed (${res.status})`);
    return null;
  }

  const body: TikTokUserResponse = await res.json();
  const user = body?.data?.user;
  if (!user?.display_name || user?.follower_count === undefined) return null;

  return { displayName: user.display_name, followerCount: user.follower_count };
}

async function fetchVideoCovers(
  accessToken: string,
  count: number = 3
): Promise<string[]> {
  const res = await fetch(
    "https://open.tiktokapis.com/v2/video/list/?fields=id,cover_image_url",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: count }),
    }
  );

  if (!res.ok) {
    console.warn(`[next-links] TikTok video list failed (${res.status})`);
    return [];
  }

  const body: TikTokVideoListResponse = await res.json();
  return (body?.data?.videos ?? [])
    .map((v) => v.cover_image_url)
    .filter(Boolean);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Format a raw follower count into a compact human-readable string.
 *   1500     → "1.5K"
 *   17500    → "17.5K"
 *   1200000  → "1.2M"
 */
export function formatFollowerCount(count: number): string {
  if (count >= 1_000_000) {
    const s = (count / 1_000_000).toFixed(1);
    return `${s.replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    const s = (count / 1_000).toFixed(1);
    return `${s.replace(/\.0$/, "")}K`;
  }
  return count.toLocaleString();
}

/**
 * Top-level orchestrator called from app/page.tsx at build time.
 *
 * Returns null when env vars are not configured — the page falls back to
 * the static followerCount in links.ts with no further action required.
 */
export async function fetchTikTokApiData(): Promise<TikTokApiResult | null> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const refreshToken = process.env.TIKTOK_REFRESH_TOKEN;

  if (!clientKey || !clientSecret || !refreshToken) return null;

  try {
    const accessToken = await refreshAccessToken(clientKey, clientSecret, refreshToken);

    const [userInfo, videoCoverUrls] = await Promise.all([
      fetchUserInfo(accessToken),
      fetchVideoCovers(accessToken, 3),
    ]);

    if (!userInfo) return null;

    return { ...userInfo, videoCoverUrls };
  } catch (err) {
    console.warn("[next-links] TikTok API fetch failed:", err);
    return null;
  }
}
