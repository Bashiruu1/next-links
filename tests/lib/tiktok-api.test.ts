import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatFollowerCount } from "@/lib/platforms/utils";
import { TikTokClient } from "@/lib/platforms/tiktok/TikTokClient";
import { TikTokService } from "@/lib/platforms/tiktok/TikTokService";
import { EMPTY_PLATFORM_DATA } from "@/lib/platforms/types";

// ── helpers ───────────────────────────────────────────────────────────────────

function stubEnv(vars: Record<string, string>) {
  const originals: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(vars)) {
    originals[key] = process.env[key];
    process.env[key] = value;
  }
  return () => {
    for (const [key, original] of Object.entries(originals)) {
      if (original === undefined) delete process.env[key];
      else process.env[key] = original;
    }
  };
}

function mockFetchSequence(
  responses: Array<{ ok: boolean; json?: object; text?: string }>
) {
  const spy = vi.fn();
  for (const r of responses) {
    spy.mockResolvedValueOnce({
      ok: r.ok,
      status: r.ok ? 200 : 400,
      json: () => Promise.resolve(r.json ?? {}),
      text: () => Promise.resolve(r.text ?? ""),
    });
  }
  vi.stubGlobal("fetch", spy);
  return spy;
}

const ENV = {
  TIKTOK_CLIENT_KEY: "test-key",
  TIKTOK_CLIENT_SECRET: "test-secret",
  TIKTOK_REFRESH_TOKEN: "test-refresh-token",
};

const AUTH_CONFIG = {
  clientKeyEnvKey: "TIKTOK_CLIENT_KEY",
  clientSecretEnvKey: "TIKTOK_CLIENT_SECRET",
  refreshTokenEnvKey: "TIKTOK_REFRESH_TOKEN",
};

function makeService() {
  return new TikTokService(new TikTokClient(AUTH_CONFIG));
}

const TOKEN_RESPONSE = {
  ok: true,
  json: { access_token: "test-access-token", refresh_token: "new-refresh" },
};

const USER_RESPONSE = {
  ok: true,
  json: {
    data: {
      user: {
        display_name: "Sarah Bashir",
        follower_count: 17500,
        avatar_url: "https://p16-sign.tiktokcdn.com/avatar.jpg",
      },
    },
  },
};

const VIDEO_RESPONSE = {
  ok: true,
  json: {
    data: {
      videos: [
        { id: "1", cover_image_url: "https://cdn.tiktok.com/a.jpg" },
        { id: "2", cover_image_url: "https://cdn.tiktok.com/b.jpg" },
        { id: "3", cover_image_url: "https://cdn.tiktok.com/c.jpg" },
      ],
    },
  },
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

// ── formatFollowerCount ───────────────────────────────────────────────────────

describe("formatFollowerCount", () => {
  it("returns raw number as string below 1K", () => {
    expect(formatFollowerCount(999)).toBe("999");
    expect(formatFollowerCount(0)).toBe("0");
  });

  it("formats thousands as K without decimal when exact", () => {
    expect(formatFollowerCount(1000)).toBe("1K");
    expect(formatFollowerCount(10000)).toBe("10K");
    expect(formatFollowerCount(100000)).toBe("100K");
  });

  it("formats thousands as K with one decimal when needed", () => {
    expect(formatFollowerCount(1500)).toBe("1.5K");
    expect(formatFollowerCount(17500)).toBe("17.5K");
  });

  it("formats millions as M without decimal when exact", () => {
    expect(formatFollowerCount(1_000_000)).toBe("1M");
    expect(formatFollowerCount(2_000_000)).toBe("2M");
  });

  it("formats millions as M with one decimal when needed", () => {
    expect(formatFollowerCount(1_200_000)).toBe("1.2M");
    expect(formatFollowerCount(1_500_000)).toBe("1.5M");
  });
});

// ── TikTokService.fetch ───────────────────────────────────────────────────────

describe("TikTokService.fetch", () => {
  let restoreEnv: () => void;

  afterEach(() => {
    restoreEnv?.();
  });

  it("returns EMPTY_PLATFORM_DATA when env vars are not set", async () => {
    restoreEnv = stubEnv({
      TIKTOK_CLIENT_KEY: "",
      TIKTOK_CLIENT_SECRET: "",
      TIKTOK_REFRESH_TOKEN: "",
    });
    delete process.env.TIKTOK_CLIENT_KEY;
    delete process.env.TIKTOK_CLIENT_SECRET;
    delete process.env.TIKTOK_REFRESH_TOKEN;

    const result = await makeService().fetch("@testuser");
    expect(result).toEqual(EMPTY_PLATFORM_DATA);
  });

  it("returns EMPTY_PLATFORM_DATA when token refresh fails", async () => {
    restoreEnv = stubEnv(ENV);
    mockFetchSequence([{ ok: false, text: "Unauthorized" }]);

    const result = await makeService().fetch("@testuser");
    expect(result).toEqual(EMPTY_PLATFORM_DATA);
  });

  it("returns EMPTY_PLATFORM_DATA when user info fetch fails", async () => {
    restoreEnv = stubEnv(ENV);
    mockFetchSequence([TOKEN_RESPONSE, { ok: false }, VIDEO_RESPONSE]);

    const result = await makeService().fetch("@testuser");
    expect(result).toEqual(EMPTY_PLATFORM_DATA);
  });

  it("returns result with empty recentVideoUrls when video list fails", async () => {
    restoreEnv = stubEnv(ENV);
    mockFetchSequence([TOKEN_RESPONSE, USER_RESPONSE, { ok: false }]);

    const result = await makeService().fetch("@testuser");
    expect(result).not.toEqual(EMPTY_PLATFORM_DATA);
    expect(result.followerCount).toBe(17500);
    expect(result.displayName).toBe("Sarah Bashir");
    expect(result.recentVideoUrls).toEqual([]);
  });

  it("returns full PlatformData on success", async () => {
    restoreEnv = stubEnv(ENV);
    mockFetchSequence([TOKEN_RESPONSE, USER_RESPONSE, VIDEO_RESPONSE]);

    const result = await makeService().fetch("@testuser");
    expect(result).toEqual({
      displayName: "Sarah Bashir",
      followerCount: 17500,
      profileImageUrl: "https://p16-sign.tiktokcdn.com/avatar.jpg",
      recentVideoUrls: [
        "https://cdn.tiktok.com/a.jpg",
        "https://cdn.tiktok.com/b.jpg",
        "https://cdn.tiktok.com/c.jpg",
      ],
    });
  });

  it("calls the token endpoint with the correct form body", async () => {
    restoreEnv = stubEnv(ENV);
    const spy = mockFetchSequence([TOKEN_RESPONSE, USER_RESPONSE, VIDEO_RESPONSE]);

    await makeService().fetch("@testuser");

    const [tokenUrl, tokenInit] = spy.mock.calls[0] as [string, RequestInit];
    expect(tokenUrl).toBe("https://open.tiktokapis.com/v2/oauth/token/");
    expect(tokenInit.method).toBe("POST");
    expect(tokenInit.body).toContain("grant_type=refresh_token");
    expect(tokenInit.body).toContain("client_key=test-key");
  });

  it("calls the user info endpoint with Bearer token", async () => {
    restoreEnv = stubEnv(ENV);
    const spy = mockFetchSequence([TOKEN_RESPONSE, USER_RESPONSE, VIDEO_RESPONSE]);

    await makeService().fetch("@testuser");

    const [userUrl, userInit] = spy.mock.calls[1] as [string, RequestInit];
    expect(userUrl).toContain("/v2/user/info/");
    expect((userInit.headers as Record<string, string>)?.Authorization).toBe(
      "Bearer test-access-token"
    );
  });

  it("calls the video list endpoint with Bearer token and POST method", async () => {
    restoreEnv = stubEnv(ENV);
    const spy = mockFetchSequence([TOKEN_RESPONSE, USER_RESPONSE, VIDEO_RESPONSE]);

    await makeService().fetch("@testuser");

    const [videoUrl, videoInit] = spy.mock.calls[2] as [string, RequestInit];
    expect(videoUrl).toContain("/v2/video/list/");
    expect(videoInit.method).toBe("POST");
    expect((videoInit.headers as Record<string, string>)?.Authorization).toBe(
      "Bearer test-access-token"
    );
  });
});
