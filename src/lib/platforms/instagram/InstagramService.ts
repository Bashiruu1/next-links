import type { SocialPlatform } from "@/config/links";
import { EMPTY_PLATFORM_DATA, type PlatformData, type PlatformService } from "../types";
import { InstagramClient } from "./InstagramClient";

interface InstagramUserResponse {
  id?: string;
  name?: string;
  followers_count?: number;
  profile_picture_url?: string;
}

interface InstagramMediaItem {
  id: string;
  media_url?: string;
  thumbnail_url?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
}

interface InstagramMediaResponse {
  data?: InstagramMediaItem[];
}

export class InstagramService implements PlatformService {
  readonly platform: SocialPlatform = "instagram";

  constructor(private client: InstagramClient) {}

  profileUrl(handle: string): string {
    return this.client.profileUrl(handle);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetch(_: string): Promise<PlatformData> {
    try {
      const [userResponse, mediaResponse] = await Promise.all([
        this.client.get<InstagramUserResponse>("me", {
          fields: "id,name,followers_count,profile_picture_url",
        }),
        this.client.get<InstagramMediaResponse>("me/media", {
          fields: "id,media_url,thumbnail_url,media_type",
          limit: "3",
        }),
      ]);

      if (!userResponse) return EMPTY_PLATFORM_DATA;

      const recentVideoUrls = (mediaResponse?.data ?? [])
        .map((item) => item.thumbnail_url ?? item.media_url ?? "")
        .filter(Boolean);

      return {
        followerCount: userResponse.followers_count ?? 0,
        recentVideoUrls,
        profileImageUrl: userResponse.profile_picture_url ?? "",
        displayName: userResponse.name ?? "",
      };
    } catch {
      return EMPTY_PLATFORM_DATA;
    }
  }
}

export const instagramService = new InstagramService(
  new InstagramClient({ accessTokenEnvKey: "INSTAGRAM_ACCESS_TOKEN" })
);
