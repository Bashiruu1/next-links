import Image from "next/image";
import type { CardLink, SiteConfig } from "@/config/links";
import { PlatformIcon } from "./SocialIcons";

interface TikTokCardProps {
  item: CardLink;
  theme: SiteConfig["theme"];
  /** Resolved thumbnail URLs fetched at build time (passed from page.tsx) */
  resolvedThumbnails?: string[];
}

// ── Stacked phone placeholder (no real thumbnails) ───────────────────────────

function PhonePlaceholder({ bg }: { bg: string }) {
  const lighter = "rgba(255,255,255,0.18)";
  const darker = "rgba(0,0,0,0.20)";

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      {/* Left phone */}
      <div
        className="absolute rounded-xl overflow-hidden border border-white/10"
        style={{
          width: 90,
          height: 155,
          background: `linear-gradient(160deg, ${lighter}, ${darker})`,
          transform: "translateX(-70px) translateY(8px) rotate(-12deg)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
          <div className="h-1.5 rounded-full bg-white/25 w-3/4" />
          <div className="h-1.5 rounded-full bg-white/15 w-1/2" />
        </div>
      </div>

      {/* Centre phone */}
      <div
        className="absolute rounded-xl overflow-hidden border border-white/15 z-10"
        style={{
          width: 102,
          height: 168,
          background: `linear-gradient(145deg, rgba(255,255,255,0.22), ${darker})`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 px-2 pb-3 space-y-1">
          <div className="h-1.5 rounded-full bg-white/40 w-4/5" />
          <div className="h-1.5 rounded-full bg-white/25 w-3/5" />
        </div>
        <div className="absolute right-2 bottom-14 flex flex-col items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/20" />
          <div className="w-5 h-5 rounded-full bg-white/20" />
          <div className="w-5 h-5 rounded-full bg-white/30 mt-1" />
        </div>
      </div>

      {/* Right phone */}
      <div
        className="absolute rounded-xl overflow-hidden border border-white/10"
        style={{
          width: 88,
          height: 150,
          background: `linear-gradient(200deg, ${darker}, rgba(0,0,0,0.35))`,
          transform: "translateX(72px) translateY(6px) rotate(10deg)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
          <div className="h-1.5 rounded-full bg-white/20 w-2/3" />
          <div className="h-1.5 rounded-full bg-white/12 w-2/5" />
        </div>
      </div>
    </div>
  );
}

// ── Stacked real thumbnails ───────────────────────────────────────────────────
// Plain <img> is intentional here — thumbnails are external URLs fetched at
// build time via TikTok oEmbed. next/image doesn't support external URLs in
// static export without a custom loader. One disable covers the whole function.
/* eslint-disable @next/next/no-img-element */

interface StackedThumbnailsProps {
  thumbnails: string[]; // [left, centre, right] — up to 3
  bg: string;
}

function StackedThumbnails({ thumbnails, bg }: StackedThumbnailsProps) {
  const [left, centre, right] = thumbnails;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      {/* Left phone */}
      {left && (
        <div
          className="absolute rounded-2xl overflow-hidden"
          style={{
            width: 90,
            height: 155,
            transform: "translateX(-68px) translateY(8px) rotate(-12deg)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.40)",
            zIndex: 1,
          }}
        >
          <img
            src={left}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Centre phone (front / featured) */}
      {centre && (
        <div
          className="absolute rounded-2xl overflow-hidden"
          style={{
            width: 105,
            height: 172,
            boxShadow: "0 8px 32px rgba(0,0,0,0.50)",
            zIndex: 3,
          }}
        >
          <img
            src={centre}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Right phone */}
      {right && (
        <div
          className="absolute rounded-2xl overflow-hidden"
          style={{
            width: 90,
            height: 155,
            transform: "translateX(70px) translateY(6px) rotate(10deg)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.40)",
            zIndex: 2,
          }}
        >
          <img
            src={right}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
    </div>
  );
}
/* eslint-enable @next/next/no-img-element */

// ── Card component ────────────────────────────────────────────────────────────

export default function TikTokCard({ item, theme, resolvedThumbnails }: TikTokCardProps) {
  const hasResolved = resolvedThumbnails && resolvedThumbnails.some(Boolean);
  const hasFallbackImage = item.thumbnail && item.thumbnail.trim() !== "";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        block w-full rounded-2xl overflow-hidden
        transition-all duration-150
        hover:brightness-110 active:scale-[0.98]
      "
      style={{ backgroundColor: theme.buttonBg }}
    >
      {/* Thumbnail area */}
      <div className="relative w-full" style={{ height: 230 }}>
        {hasResolved ? (
          // Real thumbnails fetched at build time
          <StackedThumbnails
            thumbnails={resolvedThumbnails!.filter(Boolean)}
            bg={theme.buttonBg}
          />
        ) : hasFallbackImage ? (
          // Single fallback image from /public
          <Image
            src={item.thumbnail!}
            alt={item.label}
            fill
            className="object-cover"
            sizes="480px"
          />
        ) : (
          // Animated placeholder
          <PhonePlaceholder bg={theme.buttonBg} />
        )}
      </div>

      {/* Card footer */}
      <div className="flex items-center px-4 py-3">
        <span style={{ color: theme.subtextColor }} className="shrink-0 mr-2">
          <PlatformIcon platform={item.platform} />
        </span>

        <div className="flex-1 text-center">
          <p className="text-sm font-semibold" style={{ color: theme.textColor }}>
            {item.label}
          </p>
          <p className="text-xs mt-0.5" style={{ color: theme.subtextColor }}>
            {item.subtitle}
          </p>
        </div>

        <span
          className="opacity-60 shrink-0 ml-2"
          style={{ color: theme.textColor }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </span>
      </div>
    </a>
  );
}
