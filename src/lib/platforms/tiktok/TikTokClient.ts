import type { SocialPlatform } from "@/config/links";
import type { PlatformClient } from "../types";

export interface TikTokAuthConfig extends Record<string, string> {
  clientKeyEnvKey: string;
  clientSecretEnvKey: string;
  refreshTokenEnvKey: string;
}

interface TikTokTokenResponse {
  access_token: string;
}

export class TikTokClient implements PlatformClient<TikTokAuthConfig> {
  readonly platform: SocialPlatform = "tiktok";
  readonly authConfig: TikTokAuthConfig;
  // Cached per-instance so both get() and post() share one token refresh per build.
  private tokenPromise: Promise<string | null> | null = null;

  constructor(authConfig: TikTokAuthConfig) {
    this.authConfig = authConfig;
  }

  private getToken(): Promise<string | null> {
    if (!this.tokenPromise) {
      this.tokenPromise = this.fetchToken();
    }
    return this.tokenPromise;
  }

  private async fetchToken(): Promise<string | null> {
    const clientKey = process.env[this.authConfig.clientKeyEnvKey];
    const clientSecret = process.env[this.authConfig.clientSecretEnvKey];
    const refreshToken = process.env[this.authConfig.refreshTokenEnvKey];
    if (!clientKey || !clientSecret || !refreshToken) return null;
    try {
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
    } catch (err) {
      console.warn("[next-links] TikTok token error:", err);
      return null;
    }
  }

  async get<TResponse>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<TResponse | null> {
    const token = await this.getToken();
    if (!token) return null;
    try {
      const url = new URL(`https://open.tiktokapis.com/v2/${endpoint}`);
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.set(key, value);
        }
      }
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn(`[next-links] TikTok GET ${endpoint} failed (${res.status})`);
        return null;
      }
      return res.json() as Promise<TResponse>;
    } catch (err) {
      console.warn("[next-links] TikTok GET error:", err);
      return null;
    }
  }

  // Not part of PlatformClient interface — used by TikTokService for POST endpoints.
  async post<TResponse>(
    endpoint: string,
    body: unknown,
    params?: Record<string, string>
  ): Promise<TResponse | null> {
    const token = await this.getToken();
    if (!token) return null;
    try {
      const url = new URL(`https://open.tiktokapis.com/v2/${endpoint}`);
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.set(key, value);
        }
      }
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.warn(`[next-links] TikTok POST ${endpoint} failed (${res.status})`);
        return null;
      }
      return res.json() as Promise<TResponse>;
    } catch (err) {
      console.warn("[next-links] TikTok POST error:", err);
      return null;
    }
  }
}
