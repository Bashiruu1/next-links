import type { SocialPlatform } from "@/config/links";
import type { PlatformService } from "./types";
import { tiktokService } from "./tiktok/TikTokService";
import { instagramService } from "./instagram/InstagramService";

export const platformRegistry: Partial<Record<SocialPlatform, PlatformService>> = {
  tiktok: tiktokService,
  instagram: instagramService,
};
