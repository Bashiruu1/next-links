"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { config } from "@/config/links";
import { useShare } from "@/hooks/useShare";
import ShareModal from "@/components/ShareModal";
import LinkShareOverlay from "@/components/LinkShareOverlay";

interface ShareButtonProps {
  /** URL to share (passed to navigator.share). */
  url: string;
  /** Title to share (passed to navigator.share). */
  title: string;
  /** Optional explicit text color for the icon. Inherits from parent if omitted. */
  color?: string;
  /** Extra Tailwind classes appended after the base styles (e.g. positioning, margins). */
  className?: string;
  /** When provided, opens a LinkShareOverlay instead of the generic ShareModal. */
  shareOverlay?: {
    image?: string;
    shareTitle?: string;
    shareDescription?: string;
  };
}

/**
 * Three-dot share button used on every link type. Tries navigator.share first
 * and falls back to the ShareModal. The modal renders through a portal to
 * document.body so parent CSS `filter`/`transform` (e.g. hover:brightness)
 * doesn't trap the fixed-position overlay inside the link card.
 */
export default function ShareButton({ url, title, color, className = "", shareOverlay }: ShareButtonProps) {
  const { handleShare, shareOpen, setShareOpen } = useShare(url, title);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Share"
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition ${className}`}
        style={{
          opacity: hovered ? 1 : 0.5,
          backgroundColor: hovered ? "rgba(0,0,0,0.19)" : "transparent",
          ...(color ? { color } : {}),
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {mounted && shareOpen && createPortal(
        shareOverlay ? (
          <LinkShareOverlay
            url={url}
            image={shareOverlay.image}
            shareTitle={shareOverlay.shareTitle}
            shareDescription={shareOverlay.shareDescription}
            onClose={() => setShareOpen(false)}
          />
        ) : (
          <ShareModal
            username={config.profile.username}
            onClose={() => setShareOpen(false)}
          />
        ),
        document.body
      )}
    </>
  );
}
