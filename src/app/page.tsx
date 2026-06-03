import { config, LinkType } from "@/config/links";
import type { CardLink, LinkItem } from "@/config/links";
import { platformRegistry } from "@/lib/platforms/registry";
import { formatFollowerCount } from "@/lib/platforms/utils";
import { EMPTY_PLATFORM_DATA, type PlatformData } from "@/lib/platforms/types";
import { fetchThumbnailsFromUrls } from "@/lib/platforms/tiktok/TikTokService";
import ProfileHeader from "@/components/ProfileHeader";
import LinkButton from "@/components/LinkButton";
import MediaCard from "@/components/MediaCard";
import SocialPill from "@/components/SocialPill";
import TopBar from "@/components/TopBar";

// ── Data resolution ───────────────────────────────────────────────────────────

interface CardResult {
  platformData: PlatformData;
  thumbnails: string[];
  resolvedUrl: string;
}

async function resolveCardData(links: LinkItem[]): Promise<Map<number, CardResult>> {
  const cardMap = new Map<number, CardResult>();

  await Promise.all(
    links.map(async (link, index) => {
      if (link.type !== LinkType.Card) return;

      let platformData = EMPTY_PLATFORM_DATA;
      let thumbnails: string[] = [];
      let resolvedUrl = link.url ?? "";

      if (link.platform && link.handle) {
        const service = platformRegistry[link.platform];
        if (service) {
          platformData = await service.fetch(link.handle);
          thumbnails = platformData.recentVideoUrls;
          if (!resolvedUrl) resolvedUrl = service.profileUrl(link.handle);
        }
      } else if (link.videos?.length) {
        // Deprecated: backwards compat for hardcoded video URLs
        thumbnails = await fetchThumbnailsFromUrls(link.videos);
      }

      cardMap.set(index, { platformData, thumbnails, resolvedUrl });
    })
  );

  return cardMap;
}

function buildSubtitle(link: CardLink, data: PlatformData): string {
  const count = data.followerCount > 0 ? data.followerCount : link.followerCount;
  const name = link.displayName ?? (data.displayName || null);
  const formatted = count !== undefined ? `${formatFollowerCount(count)} Followers` : null;
  if (name && formatted) return `${name} · ${formatted}`;
  return name ?? formatted ?? "";
}

// ── Page ─────────────────────────────────────────────────────────────────────

export const revalidate = 86400; // re-fetch platform data once per day

export default async function Home() {
  const { profile, socials, links, theme, meta } = config;

  const cardDataMap = await resolveCardData(links);

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
            const key = `${link.type}-${index}`;

            if (link.type === LinkType.Button) {
              return <LinkButton key={key} item={link} theme={theme} />;
            }

            if (link.type === LinkType.Card) {
              const cardResult = cardDataMap.get(index);
              const platformData = cardResult?.platformData ?? EMPTY_PLATFORM_DATA;
              const itemWithUrl = { ...link, url: cardResult?.resolvedUrl ?? link.url ?? "" };
              return (
                <MediaCard
                  key={key}
                  item={itemWithUrl}
                  theme={theme}
                  subtitle={buildSubtitle(link, platformData)}
                  resolvedThumbnails={cardResult?.thumbnails}
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
