import { config } from "@/config/links";
import type { LinkItem } from "@/config/links";
import { fetchTikTokThumbnails } from "@/lib/tiktok";
import ProfileHeader from "@/components/ProfileHeader";
import LinkButton from "@/components/LinkButton";
import TikTokCard from "@/components/TikTokCard";
import SocialPill from "@/components/SocialPill";
import TopBar from "@/components/TopBar";

// ── Build-time thumbnail resolution ──────────────────────────────────────────
//
// Because this is a Next.js Server Component, all async work here runs at
// `npm run build` time. The resulting HTML is fully static — no server needed.
//
// Card items with a `videos` array will have their TikTok thumbnails fetched
// from TikTok's public oEmbed API and baked into the HTML output.

async function resolveCardThumbnails(
  links: LinkItem[]
): Promise<Map<number, string[]>> {
  const thumbnailMap = new Map<number, string[]>();

  await Promise.all(
    links.map(async (link, index) => {
      // TypeScript narrows `link` to CardLink here — no cast needed
      if (link.type === "card" && link.videos?.length) {
        const thumbnails = await fetchTikTokThumbnails(link.videos);
        thumbnailMap.set(index, thumbnails);
      }
    })
  );

  return thumbnailMap;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const { profile, socials, links, theme, meta } = config;

  // Fetch TikTok thumbnails at build time (no-op if no videos configured)
  const thumbnailMap = await resolveCardThumbnails(links);

  return (
    <main className="links-page min-h-screen w-full">
      {/* Fixed top-left logo + top-right share button */}
      <TopBar username={profile.username} repoUrl={meta.repoUrl} />

      {/* Centred content column — max 480 px wide, matching Linktree's mobile-first layout */}
      <div className="mx-auto w-full max-w-[480px] px-4 pb-16">
        {/* Profile (avatar, name, bio, social icons) */}
        <ProfileHeader profile={profile} socials={socials} theme={theme} />

        {/* Link items */}
        <div className="flex flex-col gap-3 mt-2">
          {links.map((link, index) => {
            const key = `${link.type}-${link.url}`;

            if (link.type === "button") {
              return <LinkButton key={key} item={link} theme={theme} />;
            }

            if (link.type === "card") {
              // TypeScript narrows link to CardLink after the type check above
              return (
                <TikTokCard
                  key={key}
                  item={link}
                  theme={theme}
                  resolvedThumbnails={thumbnailMap.get(index)}
                />
              );
            }

            if (link.type === "social") {
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
