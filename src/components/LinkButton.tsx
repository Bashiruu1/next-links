"use client";

import type { ButtonLink, SiteConfig } from "@/config/links";
import { formatFollowerCount } from "@/lib/tiktok-api";
import ShareButton from "@/components/ShareButton";

interface LinkButtonProps {
  item: ButtonLink;
  theme: SiteConfig["theme"];
}

export default function LinkButton({ item, theme }: LinkButtonProps) {
  const hasImage = item.image && item.image.trim() !== "";

  return (
    <div
      className="flex items-center w-full rounded-full transition-all duration-150 hover:brightness-110"
      style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center flex-1 px-3 py-3 min-w-0 active:scale-[0.98]"
        style={{ color: "inherit" }}
      >
        {/* Left image */}
        {hasImage ? (
          <img
            src={item.image}
            alt={item.label}
            className="rounded-full object-cover shrink-0"
            style={{ width: 36, height: 36 }}
          />
        ) : (
          <div style={{ width: 36, height: 36 }} className="shrink-0" />
        )}

        <span className="flex-1 text-center flex flex-col leading-tight">
          <span className="text-sm font-medium">{item.label}</span>
          {item.followerCount !== undefined && (
            <span className="text-xs mt-0.5 opacity-70">
              {formatFollowerCount(item.followerCount)} Followers
            </span>
          )}
        </span>
      </a>

      <ShareButton
        url={item.url}
        title={item.label}
        className="mr-2"
        shareOverlay={{
          image: item.image,
          shareTitle: item.share.title,
          shareDescription: item.share.description,
        }}
      />
    </div>
  );
}
