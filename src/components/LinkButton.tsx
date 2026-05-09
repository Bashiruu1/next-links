import type { ButtonLink, SiteConfig } from "@/config/links";
import { formatFollowerCount } from "@/lib/tiktok-api";

interface LinkButtonProps {
  item: ButtonLink;
  theme: SiteConfig["theme"];
}

export default function LinkButton({ item, theme }: LinkButtonProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex items-center justify-between w-full
        rounded-full px-5 py-3.5
        text-sm font-medium text-center
        transition-all duration-150
        hover:brightness-110 active:scale-[0.98]
      "
      style={{
        backgroundColor: theme.buttonBg,
        color: theme.buttonText,
      }}
    >
      {/* Spacer so label stays centred */}
      <span className="w-4 shrink-0" />

      <span className="flex-1 text-center flex flex-col leading-tight">
        <span>{item.label}</span>
        {item.followerCount !== undefined && (
          <span className="text-xs mt-0.5 opacity-70">
            {formatFollowerCount(item.followerCount)} Followers
          </span>
        )}
      </span>

      {/* Three-dot menu indicator */}
      <span
        className="w-5 shrink-0 flex items-center justify-end opacity-60"
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
