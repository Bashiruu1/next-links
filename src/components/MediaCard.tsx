"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { CardLink, SiteConfig, SocialPlatform } from "@/config/links";
import { PlatformIcon } from "./SocialIcons";
import ShareButton from "@/components/ShareButton";

interface MediaCardProps {
  item: CardLink;
  theme: SiteConfig["theme"];
  /** Subtitle string computed by page.tsx (formatted follower count). */
  subtitle: string;
  /** Resolved thumbnail URLs fetched at build time (passed from page.tsx) */
  resolvedThumbnails?: string[];
}

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  twitter: "Twitter",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  github: "GitHub",
  website: "Website",
};

// ── Phone positions ───────────────────────────────────────────────────────────

const PHONE_STACKED = {
  left:   { transform: "translateX(-68px) translateY(8px) rotate(-12deg)",   zIndex: 1 },
  center: { transform: "translateX(0px) translateY(0px) rotate(0deg)",        zIndex: 3 },
  right:  { transform: "translateX(70px) translateY(6px) rotate(10deg)",     zIndex: 2 },
} as const;

const PHONE_FANNED = {
  left:   { transform: "translateX(-110px) translateY(22px) rotate(-28deg)", zIndex: 1 },
  center: { transform: "translateX(0px) translateY(-8px) rotate(0deg)",       zIndex: 3 },
  right:  { transform: "translateX(110px) translateY(22px) rotate(28deg)",   zIndex: 2 },
} as const;

// ── Stacked phone placeholder ─────────────────────────────────────────────────

function PhonePlaceholder({ bg }: { bg: string }) {
  const lighter = "rgba(255,255,255,0.18)";
  const darker  = "rgba(0,0,0,0.20)";

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: bg }}>
      <div className="absolute rounded-xl overflow-hidden border border-white/10" style={{ width: 90, height: 155, background: `linear-gradient(160deg, ${lighter}, ${darker})`, transform: PHONE_STACKED.left.transform, boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
        <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
          <div className="h-1.5 rounded-full bg-white/25 w-3/4" />
          <div className="h-1.5 rounded-full bg-white/15 w-1/2" />
        </div>
      </div>
      <div className="absolute rounded-xl overflow-hidden border border-white/15 z-10" style={{ width: 102, height: 168, background: `linear-gradient(145deg, rgba(255,255,255,0.22), ${darker})`, boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>
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
      <div className="absolute rounded-xl overflow-hidden border border-white/10" style={{ width: 88, height: 150, background: `linear-gradient(200deg, ${darker}, rgba(0,0,0,0.35))`, transform: PHONE_STACKED.right.transform, boxShadow: "0 4px 24px rgba(0,0,0,0.30)" }}>
        <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
          <div className="h-1.5 rounded-full bg-white/20 w-2/3" />
          <div className="h-1.5 rounded-full bg-white/12 w-2/5" />
        </div>
      </div>
    </div>
  );
}

// ── Stacked thumbnails with hover fan-out ─────────────────────────────────────
/* eslint-disable @next/next/no-img-element */

function StackedThumbnails({ thumbnails, bg, fanned }: { thumbnails: string[]; bg: string; fanned: boolean }) {
  const [left, centre, right] = thumbnails;
  const pos        = fanned ? PHONE_FANNED : PHONE_STACKED;
  const transition = "transform 0.35s ease-out";

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: bg }}>
      {left && (
        <div className="absolute rounded-2xl overflow-hidden" style={{ width: 90, height: 155, transform: pos.left.transform, zIndex: pos.left.zIndex, boxShadow: "0 4px 20px rgba(0,0,0,0.40)", transition }}>
          <img src={left} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      {centre && (
        <div className="absolute rounded-2xl overflow-hidden" style={{ width: 105, height: 172, transform: pos.center.transform, zIndex: pos.center.zIndex, boxShadow: "0 8px 32px rgba(0,0,0,0.50)", transition }}>
          <img src={centre} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      {right && (
        <div className="absolute rounded-2xl overflow-hidden" style={{ width: 90, height: 155, transform: pos.right.transform, zIndex: pos.right.zIndex, boxShadow: "0 4px 20px rgba(0,0,0,0.40)", transition }}>
          <img src={right} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
    </div>
  );
}
/* eslint-enable @next/next/no-img-element */

// ── Modal (only used when platform is set) ────────────────────────────────────
/* eslint-disable @next/next/no-img-element */

type CardLinkWithPlatform = CardLink & { platform: SocialPlatform };

function MediaModal({
  item,
  subtitle,
  resolvedThumbnails,
  onClose,
}: {
  item: CardLinkWithPlatform;
  subtitle: string;
  resolvedThumbnails?: string[];
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Trigger entrance animation on next frame so the CSS transition fires
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 320);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const thumbs = resolvedThumbnails?.filter(Boolean) ?? [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: visible ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)", transition: "background-color 0.32s ease" }}
      onClick={close}
    >
      <div
        className="relative bg-white rounded-3xl w-full max-w-[480px] overflow-hidden"
        style={{ transform: visible ? "scale(1)" : "scale(0.92)", opacity: visible ? 1 : 0, transition: "transform 0.28s cubic-bezier(0.32,0.72,0,1), opacity 0.28s ease" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <span className="text-base font-semibold text-gray-900">{item.label}</span>
          <button
            onClick={close}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-sm hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Profile info */}
        <div className="px-5 pb-4">
          {item.displayName && (
            <p className="font-semibold text-gray-900 text-sm">{item.displayName}</p>
          )}
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Thumbnails */}
        {thumbs.length > 0 && (
          <div className="px-5 pb-5 flex gap-2 overflow-x-auto">
            {thumbs.map((src, i) => (
              <div key={i} className="shrink-0 rounded-2xl overflow-hidden" style={{ width: 130, height: 190 }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}

        {/* Follow button */}
        <div className="px-5 pb-8 pt-1">
          <a
            href={item.url ?? ""}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3.5 rounded-full text-center text-sm font-semibold text-white bg-black hover:opacity-80 transition-opacity"
          >
            Follow on {PLATFORM_LABELS[item.platform]}
          </a>
        </div>
      </div>
    </div>
  );
}
/* eslint-enable @next/next/no-img-element */

// ── Card component ────────────────────────────────────────────────────────────

export default function MediaCard({ item, theme, subtitle, resolvedThumbnails }: MediaCardProps) {
  const [hovered,   setHovered]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  // Guard portal against SSR
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const hasResolved      = resolvedThumbnails && resolvedThumbnails.some(Boolean);
  const hasFallbackImage = item.thumbnail && item.thumbnail.trim() !== "";

  const thumbnailArea = (
    <div className="relative w-full" style={{ height: 230 }}>
      {hasResolved ? (
        <StackedThumbnails
          thumbnails={resolvedThumbnails!.filter(Boolean)}
          bg={theme.buttonBg}
          fanned={hovered}
        />
      ) : hasFallbackImage ? (
        <Image src={item.thumbnail!} alt={item.label} fill className="object-cover" sizes="480px" />
      ) : item.videos?.length ? (
        <PhonePlaceholder bg={theme.buttonBg} />
      ) : null}
    </div>
  );

  return (
    <>
      <div className="w-full rounded-2xl overflow-hidden" style={{ backgroundColor: theme.buttonBg }}>
        {/* Thumbnail — platform cards open modal; generic cards link directly */}
        {item.platform ? (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="block w-full text-left transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            {thumbnailArea}
          </button>
        ) : (
          <a
            href={item.url ?? ""}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="block w-full transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            {thumbnailArea}
          </a>
        )}

        {/* Footer */}
        <div
          className="flex items-center px-4 py-3 cursor-pointer hover:brightness-110"
          onClick={item.platform ? () => setShowModal(true) : undefined}
        >
          {item.platform && (
            <span style={{ color: theme.subtextColor }} className="shrink-0 mr-2">
              <PlatformIcon platform={item.platform} />
            </span>
          )}
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold" style={{ color: theme.textColor }}>{item.label}</p>
            <p className="text-xs mt-0.5" style={{ color: theme.subtextColor }}>{subtitle}</p>
          </div>
          <ShareButton
            url={item.url ?? ""}
            title={item.label}
            color={theme.textColor}
            className="ml-2"
            shareOverlay={{ image: resolvedThumbnails?.find(Boolean) ?? item.thumbnail }}
          />
        </div>
      </div>

      {item.platform && mounted && showModal && createPortal(
        <MediaModal
          item={item as CardLinkWithPlatform}
          subtitle={subtitle}
          resolvedThumbnails={resolvedThumbnails}
          onClose={() => setShowModal(false)}
        />,
        document.body
      )}
    </>
  );
}
