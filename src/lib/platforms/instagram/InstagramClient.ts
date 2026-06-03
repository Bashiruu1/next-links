import type { SocialPlatform } from "@/config/links";
import type { PlatformClient } from "../types";

export interface InstagramAuthConfig extends Record<string, string> {
  accessTokenEnvKey: string;
}

export class InstagramClient implements PlatformClient<InstagramAuthConfig> {
  readonly platform: SocialPlatform = "instagram";
  readonly authConfig: InstagramAuthConfig;
  readonly baseAddress: string;

  constructor(authConfig: InstagramAuthConfig, baseAddress = "https://www.instagram.com") {
    this.authConfig = authConfig;
    this.baseAddress = baseAddress;
  }

  profileUrl(handle: string): string {
    return `${this.baseAddress}/${handle.replace(/^@/, "")}`;
  }

  async get<TResponse>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<TResponse | null> {
    const accessToken = process.env[this.authConfig.accessTokenEnvKey];
    if (!accessToken) return null;
    try {
      const url = new URL(`https://graph.instagram.com/v21.0/${endpoint}`);
      url.searchParams.set("access_token", accessToken);
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.set(key, value);
        }
      }
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.warn(`[next-links] Instagram GET ${endpoint} failed (${res.status})`);
        return null;
      }
      return res.json() as Promise<TResponse>;
    } catch (err) {
      console.warn("[next-links] Instagram client error:", err);
      return null;
    }
  }
}
