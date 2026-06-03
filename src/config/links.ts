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

/**
 * Discriminant values for the three link types.
 * Reference as LinkType.Button, LinkType.Card, LinkType.Social.
 */
export const LinkType = {
  Button: "button",
  Card: "card",
  Social: "social",
} as const;

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
 * Fields shared by all link types.
 * followerCount is optional on all link types.
 */
interface LinkBase {
  /**
   * Follower / subscriber count for this link's platform (e.g. 17500 → "17.5K Followers").
   * When the TikTok API is configured on a card, the live value overrides this.
   */
  followerCount?: number;
  /**
   * Display name shown before the formatted follower count, e.g. "♪ Sarah Bashir 🌟".
   * Falls back to the name returned by the TikTok API when not set on a card.
   */
  displayName?: string;
}

/** A plain pill-shaped button — the simplest link type. */
export interface ButtonLink extends LinkBase {
  type: typeof LinkType.Button;
  /** Text shown inside the button */
  label: string;
  /** Destination URL */
  url: string;
  /**
   * Optional small circular image shown on the left side of the button.
   * Place the file in /public and use a leading slash, e.g. "/avatar.jpg"
   */
  image?: string;
  /** Share overlay metadata — required so the three-dot button opens a rich preview */
  share: {
    /** Bold title shown in the preview card */
    title: string;
    /** Description shown in the preview card with a More / Less toggle */
    description: string;
  };
}

/**
 * A tall card that shows up to 3 stacked video thumbnails — great for TikTok/Instagram.
 *
 * HOW THUMBNAILS WORK (recommended):
 *
 *   1. Set `platform` to the platform name (e.g. "tiktok") and `handle` to your
 *      username (e.g. "@sarah.rh.bashir").
 *   2. Configure the platform's env vars (see src/lib/platforms/<platform>/).
 *   3. Run `npm run build` — the platform service fetches live follower count,
 *      recent video thumbnails, and profile image at build time.
 *   4. To keep data fresh, rebuild periodically (automated via GitHub Actions cron).
 *
 * FALLBACK: When env vars are not set, the card shows the stacked-phone placeholder
 * and falls back to the static `followerCount` / `displayName` in this config.
 *
 * LEGACY: The `videos` field (hardcoded TikTok URLs) still works but is deprecated.
 * Prefer `platform` + `handle` so the config stays human-editable.
 */
export interface CardLink extends LinkBase {
  type: typeof LinkType.Card;
  /**
   * Social platform for this card. When set alongside `handle`, follower count,
   * recent video thumbnails, and profile image are fetched at build time.
   * Also controls the "Follow on [Platform]" CTA in the click-through modal.
   */
  platform?: SocialPlatform;
  /**
   * Your platform handle (e.g. "@sarah.rh.bashir"). Required for build-time
   * data fetching. Ignored when the platform's env vars are not configured.
   */
  handle?: string;
  /** Card headline (e.g. "TikTok") */
  label: string;
  /**
   * Static fallback follower count (e.g. 17500 → "17.5K Followers").
   * Shown when the platform fetch fails or env vars are not configured.
   * Omit to hide the follower count entirely.
   */
  followerCount?: number;
  /**
   * @deprecated Use `platform` + `handle` instead.
   * Up to 3 public TikTok video URLs fetched via oEmbed at build time.
   * Still works, but hardcodes video URLs that go stale as you post new content.
   */
  videos?: string[];
  /**
   * Optional fallback: path to a single local thumbnail image in /public.
   * Used only when no thumbnails are resolved (no handle, no videos).
   * Leave as "" to show the stacked-phone placeholder instead.
   */
  thumbnail?: string;
  /**
   * Destination URL. Optional when `platform` + `handle` are both set —
   * the URL is derived automatically (e.g. tiktok.com/@handle).
   * Set explicitly to override the derived URL.
   */
  url?: string;
}

/** A pill button that shows a small circular avatar on the left — ideal for Instagram, Twitter, etc. */
export interface SocialPillLink extends LinkBase {
  type: typeof LinkType.Social;
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
    avatar: "https://ugc.production.linktr.ee/21394185-b95b-4177-aa0e-1a615db2aa74_IMG-0904.jpeg?io=true&size=avatar-v3_0",
    username: "sarah.bashir",
  },

  // ── Social icon row ───────────────────────────────────────────────────────
  socials: [
    { platform: "instagram", url: "https://www.instagram.com/sarah.rh.bashir" },
    { platform: "tiktok", url: "https://www.tiktok.com/@sarah.rh.bashir" },
  ],

  // ── Link items ────────────────────────────────────────────────────────────
  links: [
      {
            type: LinkType.Card,
            label: "Free Cybersecurity Roadmap 2026",
            url: "./learning_about_cyber_security.html",
          },
    // 1 · Plain button
    {
      type: LinkType.Button,
      label: "Code: SARAH5 to save on AfroPuppy Yoga",
      url: "https://afropuppyyoga.ca/?srsltid=AfmBOooJKtZe-lSmBUmwc2BD5mJn8zAhwSfq8iyTHVnGySCAhhOdY98m", // ← REPLACE with real URL before deploying
      image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663446228701/pFRlGBKuUoljEWjn.png",
      share: {
        title: "AfroPuppy Yoga | Puppy Yoga Studio in Canada",
        description: "Canada's #1 puppy yoga studio. Guided yoga, Afro-beat rhythms & adorable puppies in Mississauga, Hamilton, and Kitchener. Book your class today!",
      },
    },
    {
      type: LinkType.Button,
      label: "Shop gluten-free ice cream treats by 10% off",
      url: "https://shop.fourall.ca/?ref=gdklprrw", // ← REPLACE with real URL before deploying
      share: {
        title: "Shop Our Ice Cream Catalog | Four All Ice Cream",
        description: "Shop our gluten-free, A2 milk and plant-based ice cream cakes, tubs, cups, bars, bundles, and more through our online ice cream shop.",
      },
    },

    // 2 · TikTok feature card
    // Set TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET / TIKTOK_REFRESH_TOKEN as
    // GitHub Actions secrets to enable live follower count + video covers.
    // Without those env vars the card falls back to the static values below.
    {
      type: LinkType.Card,
      platform: "tiktok",
      handle: "@sarah.rh.bashir",
      label: "TikTok",
      displayName: "♪ Sarah Bashir 🌟",
      followerCount: 17500, // static fallback shown when API is not configured
      thumbnail: "",
    },

    // 3 · Instagram social pill
    {
      type: LinkType.Social,
      platform: "instagram",
      label: "Instagram",
      avatar: "https://ugc.production.linktr.ee/ed88d7de-1266-4309-ab0b-e1f472e8a526_589307434-17881643667422694-2500623199717504514-n.jpeg?io=true&size=thumbnail-stack_v1_0",
      url: "https://www.instagram.com/sarah.rh.bashir",
      followerCount: 8700
    }
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
    url: "https://Bashiruu1.github.io/next-links",
    repoUrl: "https://github.com/Bashiruu1/next-links",
  },
};
