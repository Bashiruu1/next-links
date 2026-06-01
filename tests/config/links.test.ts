import { describe, it, expect } from "vitest";
import { config, LinkType } from "@/config/links";
import type { ButtonLink, CardLink, SocialPillLink } from "@/config/links";

// ── profile ───────────────────────────────────────────────────────────────────

describe("config.profile", () => {
  it("has a non-empty name", () => {
    expect(config.profile.name.trim()).not.toBe("");
  });

  it("has a non-empty bio", () => {
    expect(config.profile.bio.trim()).not.toBe("");
  });

  it("has a non-empty avatar", () => {
    expect(config.profile.avatar.trim()).not.toBe("");
  });

  it("has a non-empty username", () => {
    expect(config.profile.username.trim()).not.toBe("");
  });
});

// ── socials ───────────────────────────────────────────────────────────────────

describe("config.socials", () => {
  it("is an array", () => {
    expect(Array.isArray(config.socials)).toBe(true);
  });

  it("every entry has a platform and a url", () => {
    config.socials.forEach((s) => {
      expect(s.platform).toBeTruthy();
      expect(s.url).toMatch(/^https?:\/\//);
    });
  });
});

// ── links ─────────────────────────────────────────────────────────────────────

describe("config.links", () => {
  it("is a non-empty array", () => {
    expect(config.links.length).toBeGreaterThan(0);
  });

  it("every item has a valid type", () => {
    const validTypes = new Set([LinkType.Button, LinkType.Card, LinkType.Social]);
    config.links.forEach((link) => {
      expect(validTypes.has(link.type)).toBe(true);
    });
  });

  it("button items have a label and a url", () => {
    config.links
      .filter((l): l is ButtonLink => l.type === LinkType.Button)
      .forEach((link) => {
        expect(link.label.trim()).not.toBe("");
        expect(link.url).toBeTruthy();
      });
  });

  it("card items have a label, followerCount, and url", () => {
    config.links
      .filter((l): l is CardLink => l.type === LinkType.Card)
      .forEach((link) => {
        expect(link.label.trim()).not.toBe("");
        expect(typeof link.followerCount).toBe("number");
        expect(link.followerCount).toBeGreaterThanOrEqual(0);
        expect(link.url).toBeTruthy();
      });
  });

  it("card items with videos have an array of strings", () => {
    config.links
      .filter((l): l is CardLink => l.type === LinkType.Card)
      .forEach((link) => {
        if (link.videos !== undefined) {
          expect(Array.isArray(link.videos)).toBe(true);
          link.videos.forEach((v) => expect(typeof v).toBe("string"));
        }
      });
  });

  it("social items have a platform, label, and url", () => {
    config.links
      .filter((l): l is SocialPillLink => l.type === LinkType.Social)
      .forEach((link) => {
        expect(link.platform).toBeTruthy();
        expect(link.label.trim()).not.toBe("");
        expect(link.url).toBeTruthy();
      });
  });
});

// ── theme ─────────────────────────────────────────────────────────────────────

describe("config.theme", () => {
  const REQUIRED_KEYS: Array<keyof typeof config.theme> = [
    "background",
    "gridColor",
    "buttonBg",
    "buttonText",
    "textColor",
    "subtextColor",
  ];

  it.each(REQUIRED_KEYS)('theme.%s is a non-empty string', (key: typeof REQUIRED_KEYS[number]) => {
    expect(typeof config.theme[key]).toBe("string");
    expect(config.theme[key].trim()).not.toBe("");
  });
});

// ── meta ──────────────────────────────────────────────────────────────────────

describe("config.meta", () => {
  it("has a non-empty title", () => {
    expect(config.meta.title.trim()).not.toBe("");
  });

  it("has a non-empty description", () => {
    expect(config.meta.description.trim()).not.toBe("");
  });

  it("has a url string", () => {
    expect(typeof config.meta.url).toBe("string");
    expect(config.meta.url.trim()).not.toBe("");
  });

  it("has a repoUrl string", () => {
    expect(typeof config.meta.repoUrl).toBe("string");
    expect(config.meta.repoUrl.trim()).not.toBe("");
  });
});
