"use client";

import type { SocialPillLink, SiteConfig } from "@/config/links";
import { formatFollowerCount } from "@/lib/tiktok-api";
import ShareButton from "@/components/ShareButton";

interface SocialPillProps {
  item: SocialPillLink;
  theme: SiteConfig["theme"];
}

export default function SocialPill({ item, theme }: SocialPillProps) {
  const hasAvatar = item.avatar && item.avatar.trim() !== "";

  return (
    <div
      className="flex items-center w-full rounded-full transition-all duration-150 hover:brightness-110"
      style={{ backgroundColor: theme.buttonBg }}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center flex-1 px-3 py-3 min-w-0 active:scale-[0.98]"
      >
        {/* Left avatar */}
        {hasAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.avatar}
            alt={item.label}
            className="rounded-full object-cover shrink-0"
            style={{ width: 36, height: 36 }}
          />
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
      </a>

      <ShareButton
        url={item.url}
        title={item.label}
        color={theme.buttonText}
        className="mr-2"
        shareOverlay={{ image: item.avatar }}
      />
    </div>
  );
}
