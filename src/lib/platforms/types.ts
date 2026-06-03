import type { SocialPlatform } from "@/config/links";

export interface PlatformData {
  followerCount: number;
  recentVideoUrls: string[];
  profileImageUrl: string;
  displayName: string;
}

export const EMPTY_PLATFORM_DATA: PlatformData = {
  followerCount: 0,
  recentVideoUrls: [],
  profileImageUrl: "",
  displayName: "",
};

export interface PlatformClient<TAuthConfig extends Record<string, string>> {
  readonly platform: SocialPlatform;
  readonly authConfig: TAuthConfig;
  get<TResponse>(endpoint: string, params?: Record<string, string>): Promise<TResponse | null>;
}

export interface PlatformService {
  readonly platform: SocialPlatform;
  fetch(handle: string): Promise<PlatformData>;
}
