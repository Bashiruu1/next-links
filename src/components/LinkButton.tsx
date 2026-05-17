import type { ButtonLink, SiteConfig } from "@/config/links";
import { formatFollowerCount } from "@/lib/tiktok-api";

interface LinkButtonProps {
  item: ButtonLink;
  theme: SiteConfig["theme"];
}

export default function LinkButton({ item, theme }: LinkButtonProps) {
  const hasImage = item.image && item.image.trim() !== "";

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
      style={{
        backgroundColor: theme.buttonBg,
        color: theme.buttonText,
      }}
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

      {/* Three-dot menu indicator */}
      <span
        className="opacity-60 shrink-0 pr-1 flex items-center"
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
