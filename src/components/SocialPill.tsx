import Image from "next/image";
import type { SocialPillLink, SiteConfig } from "@/config/links";
import { formatFollowerCount } from "@/lib/tiktok-api";

interface SocialPillProps {
  item: SocialPillLink;
  theme: SiteConfig["theme"];
}

export default function SocialPill({ item, theme }: SocialPillProps) {
  const hasAvatar = item.avatar && item.avatar.trim() !== "";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex items-center w-full
        rounded-full px-3 py-3
        transition-all duration-150
        hover:brightness-110 active:scale-[0.98]
      "
      style={{ backgroundColor: theme.buttonBg }}
    >
      {/* Left avatar */}
      {hasAvatar ? (
        <div
          className="relative rounded-full overflow-hidden shrink-0"
          style={{ width: 36, height: 36 }}
        >
          <Image
            src={item.avatar!}
            alt={item.label}
            fill
            className="object-cover"
            sizes="36px"
          />
        </div>
      ) : (
        // Invisible spacer to keep layout consistent
        <div style={{ width: 36, height: 36 }} className="shrink-0" />
      )}

      {/* Label (+ optional follower count) — centred in the remaining space */}
      <span className="flex-1 text-center flex flex-col leading-tight">
        <span className="text-sm font-medium" style={{ color: theme.buttonText }}>
          {item.label}
        </span>
        {item.followerCount !== undefined && (
          <span className="text-xs mt-0.5" style={{ color: theme.subtextColor }}>
            {formatFollowerCount(item.followerCount)} Followers
          </span>
        )}
      </span>

      {/* Three-dot menu indicator */}
      <span
        className="opacity-60 shrink-0 pr-1 flex items-center"
        style={{ color: theme.buttonText }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </span>
    </a>
  );
}
