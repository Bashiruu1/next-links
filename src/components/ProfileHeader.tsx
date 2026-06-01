import type { SiteConfig } from "@/config/links";
import { PlatformIcon } from "./SocialIcons";

interface ProfileHeaderProps {
  profile: SiteConfig["profile"];
  socials: SiteConfig["socials"];
  theme: SiteConfig["theme"];
}

export default function ProfileHeader({ profile, socials, theme }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3 pt-10 pb-6">
      {/* Avatar */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.avatar}
        alt={profile.name}
        className="rounded-full object-cover"
        style={{ width: 88, height: 88 }}
      />

      {/* Name */}
      <h1
        className="text-base font-semibold leading-tight tracking-wide"
        style={{ color: theme.textColor }}
      >
        {profile.name}
      </h1>

      {/* Bio */}
      <p
        className="text-sm text-center leading-snug max-w-xs"
        style={{ color: theme.subtextColor }}
      >
        {profile.bio}
      </p>

      {/* Social icon row */}
      {socials.length > 0 && (
        <div className="flex items-center gap-4 mt-1">
          {socials.map(({ platform, url }) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={platform}
              className="transition-opacity hover:opacity-70"
              style={{ color: theme.textColor }}
            >
              <PlatformIcon platform={platform} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
