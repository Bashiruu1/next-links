import { config, LinkType } from "@/config/links";
import type { CardLink, LinkItem } from "@/config/links";
import { fetchTikTokThumbnails } from "@/lib/tiktok";
import { fetchTikTokApiData, formatFollowerCount } from "@/lib/tiktok-api";
import type { TikTokApiResult } from "@/lib/tiktok-api";
import ProfileHeader from "@/components/ProfileHeader";
import LinkButton from "@/components/LinkButton";
import TikTokCard from "@/components/TikTokCard";
import SocialPill from "@/components/SocialPill";
import TopBar from "@/components/TopBar";

// ── Build-time data resolution ────────────────────────────────────────────────
//
// All async work here runs at `npm run build` time — the result is baked into
// static HTML. No server is needed at request time.
//
// Two data sources run in parallel:
//   1. TikTok API v2 (when env vars are set) — live follower count + cover images
//   2. TikTok oEmbed (fallback) — thumbnails from manually specified video URLs

async function resolveCardThumbnails(
  links: LinkItem[]
): Promise<Map<number, string[]>> {
  const thumbnailMap = new Map<number, string[]>();

  await Promise.all(
    links.map(async (link, index) => {
      if (link.type === LinkType.Card && link.videos?.length) {
        const thumbnails = await fetchTikTokThumbnails(link.videos);
        thumbnailMap.set(index, thumbnails);
      }
    })
  );

  return thumbnailMap;
}

function buildSubtitle(link: CardLink, apiData: TikTokApiResult | null): string {
  const count = apiData?.followerCount ?? link.followerCount;
  const name = link.displayName ?? apiData?.displayName ?? null;
  const formatted = `${formatFollowerCount(count)} Followers`;
  return name ? `${name} · ${formatted}` : formatted;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const { profile, socials, links, theme, meta } = config;

  // Both fetches run in parallel at build time
  const [tikTokApiData, thumbnailMap] = await Promise.all([
    fetchTikTokApiData(),       // null when env vars not set
    resolveCardThumbnails(links), // oEmbed fallback
  ]);

  return (
    <main className="links-page min-h-screen w-full">
      {/* Fixed top-left logo + top-right share button */}
      <TopBar username={profile.username} repoUrl={meta.repoUrl} />

      {/* Centred content column — max 480 px wide, matching Linktree's mobile-first layout */}
      <div className="mx-auto w-full max-w-[480px] px-4 pb-16">
        {/* Profile (avatar, name, bio, social icons) */}
        <ProfileHeader profile={profile} socials={socials} theme={theme} />

        {/* Link items */}
        <div className="flex flex-col space-y-5 mt-2">
          {links.map((link, index) => {
            const key = `${link.type}-${link.url}`;

            if (link.type === LinkType.Button) {
              return <LinkButton key={key} item={link} theme={theme} />;
            }

            if (link.type === LinkType.Card) {
              const isTikTok = link.platform === "tiktok";
              // API covers take priority; fall back to oEmbed thumbnails
              const resolvedThumbnails =
                isTikTok && tikTokApiData
                  ? tikTokApiData.videoCoverUrls
                  : thumbnailMap.get(index);
              return (
                <TikTokCard
                  key={key}
                  item={link}
                  theme={theme}
                  subtitle={buildSubtitle(link, isTikTok ? tikTokApiData : null)}
                  resolvedThumbnails={resolvedThumbnails}
                />
              );
            }

            if (link.type === LinkType.Social) {
              return <SocialPill key={key} item={link} theme={theme} />;
            }

            return null;
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 pb-10">
        <a
          href={meta.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            rounded-full border border-white/30 bg-white/10
            px-5 py-2.5 text-sm font-medium text-white
            transition-all hover:bg-white/20
          "
        >
          Get your own next-links page
        </a>

        <p className="text-xs opacity-40" style={{ color: theme.textColor }}>
          next-links
        </p>
      </div>
    </main>
  );
}
