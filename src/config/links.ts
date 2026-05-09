// ─────────────────────────────────────────────────────────────────────────────
// next-links · config/links.ts
//
// THIS IS THE ONLY FILE YOU NEED TO EDIT to personalise your page.
//
// 1. Update `profile`   → your name, bio, avatar path, and username
// 2. Update `socials`   → which social-icon shortcuts appear under your bio
// 3. Update `links`     → your list of link items (see the three types below)
// 4. Update `theme`     → tweak colours to match your brand
// 5. Update `meta`      → SEO title + description
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "twitter"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "github"
  | "website";

/**
 * A plain pill-shaped button — the simplest link type.
 */
export interface ButtonLink {
  type: "button";
  /** Text shown inside the button */
  label: string;
  /** Destination URL */
  url: string;
}

/**
 * A tall card that shows up to 3 stacked video thumbnails — great for TikTok/YouTube.
 *
 * HOW THUMBNAILS WORK (no API key needed):
 *
 *   1. Add up to 3 public TikTok video URLs to the `videos` array below.
 *   2. Run `npm run build` — Next.js fetches thumbnails from TikTok's public
 *      oEmbed API at build time and bakes them into the static HTML.
 *   3. To keep thumbnails fresh, rebuild periodically (or automate via GitHub Actions).
 *
 * FALLBACK: If `videos` is empty/omitted, or if a fetch fails (private video,
 * network error), the card shows the animated stacked-phone placeholder.
 *
 * MANUAL THUMBNAILS: If you'd rather skip the API fetch, leave `videos` empty
 * and set `thumbnail` to a local path (e.g. "/tiktok-thumb.jpg"). That image
 * will fill the full card instead of the stacked layout.
 */
export interface CardLink {
  type: "card";
  platform: SocialPlatform;
  /** Card headline (e.g. "TikTok") */
  label: string;
  /** Smaller text below the headline (e.g. follower count) */
  subtitle: string;
  /**
   * Up to 3 public TikTok video URLs for the stacked thumbnail preview.
   * Thumbnails are fetched at build time — no API key required.
   *
   * Order: [left (back), centre (front/featured), right (back)]
   *
   * Example:
   *   videos: [
   *     "https://www.tiktok.com/@sarah.bashir/video/7123456789012345678",
   *     "https://www.tiktok.com/@sarah.bashir/video/7234567890123456789",
   *     "https://www.tiktok.com/@sarah.bashir/video/7345678901234567890",
   *   ]
   */
  videos?: string[];
  /**
   * Optional fallback: path to a single local thumbnail image in /public.
   * Used only when `videos` is empty/omitted.
   * Leave as "" to show the stacked-phone placeholder instead.
   */
  thumbnail?: string;
  /** Destination URL */
  url: string;
}

/**
 * A pill button that shows a small circular avatar on the left — ideal for
 * Instagram, Twitter, etc., to show the social profile picture.
 */
export interface SocialPillLink {
  type: "social";
  platform: SocialPlatform;
  /** Text shown inside the button */
  label: string;
  /**
   * Optional small avatar shown on the left side of the pill.
   * Place the file in /public and use a leading slash, e.g. "/avatar.jpg"
   */
  avatar?: string;
  /** Destination URL */
  url: string;
}

export type LinkItem = ButtonLink | CardLink | SocialPillLink;

export interface SiteConfig {
  profile: {
    /** Displayed name */
    name: string;
    /** One-line bio shown under the name */
    bio: string;
    /**
     * Path to your avatar image in /public, e.g. "/avatar.jpg"
     * Recommended size: 200×200 px, square or circular crop
     */
    avatar: string;
    /** Used in the page footer ("Join @username on …") */
    username: string;
  };
  /**
   * Small social-platform icons shown as a row under the bio.
   * Supported values: "instagram" | "tiktok" | "twitter" | "youtube" |
   *                   "facebook" | "linkedin" | "github" | "website"
   */
  socials: Array<{ platform: SocialPlatform; url: string }>;
  /** Ordered list of links rendered on the page */
  links: LinkItem[];
  theme: {
    /** Page background colour */
    background: string;
    /** Thin grid-line colour (CSS colour string) */
    gridColor: string;
    /** Default button / card background */
    buttonBg: string;
    /** Button text colour */
    buttonText: string;
    /** Primary text colour (name, labels) */
    textColor: string;
    /** Secondary text colour (bio, subtitles) */
    subtextColor: string;
  };
  meta: {
    /** Browser tab / SEO title */
    title: string;
    /** SEO meta description */
    description: string;
    /**
     * Canonical URL of your deployed page (used in share links).
     * e.g. "https://yourname.github.io/next-links"
     */
    url: string;
    /**
     * URL of the GitHub repo powering this page — shown in the footer
     * and share modal so visitors can get their own copy.
     */
    repoUrl: string;
  };
}

// ── Config ────────────────────────────────────────────────────────────────────

export const config: SiteConfig = {
  // ── Profile ──────────────────────────────────────────────────────────────
  profile: {
    name: "Sarah Bashir",
    bio: "Creating our dream life, one brick at a time! 🏠✨",
    // Drop your photo into /public/avatar.jpg and update this path.
    avatar: "/avatar.svg",
    username: "sarah.bashir",
  },

  // ── Social icon row ───────────────────────────────────────────────────────
  socials: [
    { platform: "instagram", url: "https://www.instagram.com/sarah.rh.bashir" },
    { platform: "tiktok", url: "https://www.tiktok.com/@sarah.rh.bashir" },
  ],

  // ── Link items ────────────────────────────────────────────────────────────
  links: [
    // 1 · Plain button
    {
      type: "button",
      label: "Shop gluten-free ice cream treats by 10% off",
      url: "#", // ← REPLACE with real URL before deploying
    },

    // 2 · TikTok feature card
    // Add your 3 most recent (or most popular) TikTok video URLs below.
    // Thumbnails are fetched automatically at build time — no API key needed.
    // Leave the array empty to show the stacked-phone placeholder instead.
    {
      type: "card",
      platform: "tiktok",
      label: "TikTok",
      subtitle: "♪ Sarah Bashir 🌟 · 17.5K Followers",
      videos: [
        // "https://www.tiktok.com/@sarah.rh.bashir/video/PASTE_VIDEO_ID_HERE",
        // "https://www.tiktok.com/@sarah.rh.bashir/video/PASTE_VIDEO_ID_HERE",
        // "https://www.tiktok.com/@sarah.rh.bashir/video/PASTE_VIDEO_ID_HERE",
      ],
      thumbnail: "", // fallback single image (optional)
      url: "https://www.tiktok.com/@sarah.rh.bashir",
    },

    // 3 · Instagram social pill
    {
      type: "social",
      platform: "instagram",
      label: "Instagram",
      avatar: "/avatar.svg",
      url: "https://www.instagram.com/sarah.rh.bashir",
    },
  ],

  // ── Theme ─────────────────────────────────────────────────────────────────
  theme: {
    background: "#3A2218",
    gridColor: "rgba(200, 160, 120, 0.10)",
    buttonBg: "#7D6452",
    buttonText: "#FFFFFF",
    textColor: "#FFFFFF",
    subtextColor: "#C8B09A",
  },

  // ── SEO / meta ────────────────────────────────────────────────────────────
  meta: {
    title: "Sarah Bashir | Links",
    description: "Creating our dream life, one brick at a time! 🏠✨",
    // Update these before deploying:
    url: "https://your-username.github.io/next-links",
    repoUrl: "https://github.com/your-username/next-links",
  },
};
