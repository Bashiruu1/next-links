import type { SocialPlatform } from "@/config/links";
import { EMPTY_PLATFORM_DATA, type PlatformData, type PlatformService } from "../types";
import { TikTokClient } from "./TikTokClient";

interface TikTokUserResponse {
  data?: {
    user?: {
      avatar_url?: string;
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

interface TikTokOembedResponse {
  thumbnail_url?: string;
}

export class TikTokService implements PlatformService {
  readonly platform: SocialPlatform = "tiktok";

  constructor(private client: TikTokClient) {}

  profileUrl(handle: string): string {
    return this.client.profileUrl(handle);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetch(_: string): Promise<PlatformData> {
    try {
      const [userResponse, videoResponse] = await Promise.all([
        this.client.get<TikTokUserResponse>("user/info/", {
          fields: "avatar_url,display_name,follower_count",
        }),
        this.client.post<TikTokVideoListResponse>(
          "video/list/",
          { max_count: 3 },
          { fields: "id,cover_image_url" }
        ),
      ]);

      if (!userResponse) return EMPTY_PLATFORM_DATA;

      const user = userResponse.data?.user;
      const recentVideoUrls = (videoResponse?.data?.videos ?? [])
        .map((v) => v.cover_image_url)
        .filter(Boolean);

      return {
        followerCount: user?.follower_count ?? 0,
        recentVideoUrls,
        profileImageUrl: user?.avatar_url ?? "",
        displayName: user?.display_name ?? "",
      };
    } catch {
      return EMPTY_PLATFORM_DATA;
    }
  }
}

/**
 * Resolves an array of TikTok video URLs to thumbnail image URLs via the
 * public oEmbed endpoint (no API key required).
 *
 * @deprecated Use a CardLink with `platform` + `handle` instead. This function
 * exists only to support the legacy `videos` field on CardLink.
 */
export async function fetchThumbnailsFromUrls(videoUrls: string[]): Promise<string[]> {
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

export const tiktokService = new TikTokService(
  new TikTokClient({
    clientKeyEnvKey: "TIKTOK_CLIENT_KEY",
    clientSecretEnvKey: "TIKTOK_CLIENT_SECRET",
    refreshTokenEnvKey: "TIKTOK_REFRESH_TOKEN",
  })
);
