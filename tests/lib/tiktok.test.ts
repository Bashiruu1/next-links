import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchThumbnailsFromUrls } from "@/lib/platforms/tiktok/TikTokService";

// ── helpers ───────────────────────────────────────────────────────────────────

function mockFetch(response: { ok: boolean; json?: object }) {
  const spy = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.ok ? 200 : 404,
    json: () => Promise.resolve(response.json ?? {}),
  });
  vi.stubGlobal("fetch", spy);
  return spy;
}

function mockFetchThrows(error: Error) {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe("fetchThumbnailsFromUrls", () => {
  it("returns an empty array immediately when given no URLs", async () => {
    const result = await fetchThumbnailsFromUrls([]);
    expect(result).toEqual([]);
  });

  it("returns an empty array when given undefined/null", async () => {
    // @ts-expect-error — deliberate misuse to test defensive code
    const result = await fetchThumbnailsFromUrls(undefined);
    expect(result).toEqual([]);
  });

  it("returns '' for a URL that does not contain 'tiktok.com'", async () => {
    // No fetch should be called for non-TikTok URLs
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    const result = await fetchThumbnailsFromUrls(["https://example.com/video/123"]);
    expect(result).toEqual([""]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns the thumbnail_url on a successful oEmbed response", async () => {
    mockFetch({
      ok: true,
      json: { thumbnail_url: "https://cdn.tiktok.com/thumb.jpg", title: "test" },
    });

    const result = await fetchThumbnailsFromUrls([
      "https://www.tiktok.com/@user/video/1234567890",
    ]);

    expect(result).toEqual(["https://cdn.tiktok.com/thumb.jpg"]);
  });

  it("returns '' when the oEmbed response contains no thumbnail_url", async () => {
    mockFetch({ ok: true, json: { title: "no thumb here" } });

    const result = await fetchThumbnailsFromUrls([
      "https://www.tiktok.com/@user/video/1234567890",
    ]);

    expect(result).toEqual([""]);
  });

  it("returns '' gracefully when the HTTP response is not ok", async () => {
    mockFetch({ ok: false });

    const result = await fetchThumbnailsFromUrls([
      "https://www.tiktok.com/@user/video/1234567890",
    ]);

    expect(result).toEqual([""]);
  });

  it("returns '' gracefully when fetch throws a network error", async () => {
    mockFetchThrows(new Error("Network failure"));

    const result = await fetchThumbnailsFromUrls([
      "https://www.tiktok.com/@user/video/1234567890",
    ]);

    expect(result).toEqual([""]);
  });

  it("processes multiple URLs independently — success and failure in parallel", async () => {
    const THUMB_A = "https://cdn.tiktok.com/a.jpg";
    const THUMB_B = "https://cdn.tiktok.com/b.jpg";

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        // First call: success with thumb A
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ thumbnail_url: THUMB_A }),
        })
        // Second call: HTTP error
        .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) })
        // Third call: success with thumb B
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ thumbnail_url: THUMB_B }),
        })
    );

    const result = await fetchThumbnailsFromUrls([
      "https://www.tiktok.com/@user/video/1",
      "https://www.tiktok.com/@user/video/2",
      "https://www.tiktok.com/@user/video/3",
    ]);

    expect(result).toEqual([THUMB_A, "", THUMB_B]);
  });

  it("calls the correct oEmbed URL, encoding the video URL as a query param", async () => {
    const fetchSpy = mockFetch({
      ok: true,
      json: { thumbnail_url: "https://cdn.tiktok.com/thumb.jpg" },
    });

    const videoUrl = "https://www.tiktok.com/@sarah.rh.bashir/video/7123456789";
    await fetchThumbnailsFromUrls([videoUrl]);

    const calledUrl: string = (fetchSpy as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calledUrl).toContain("tiktok.com/oembed");
    expect(calledUrl).toContain(encodeURIComponent(videoUrl));
  });
});
