"use client";

import { useState } from "react";
import ShareModal from "./ShareModal";

interface TopBarProps {
  username: string;
  repoUrl: string;
}

export default function TopBar({ username, repoUrl }: TopBarProps) {
  const [shareOpen, setShareOpen] = useState(false);

  async function handleShare() {
    // Use native share sheet on mobile if available
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s links`,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled (AbortError) or API not supported — fall through to modal
      }
    }
    setShareOpen(true);
  }

  return (
    <>
      {/* Top-left: next-links logo button */}
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="next-links — get your own page"
        className="
          fixed top-4 left-4 z-40
          w-10 h-10 rounded-full
          bg-white/95 shadow-sm
          flex items-center justify-center
          transition-transform hover:scale-105
        "
      >
        {/* Asterisk / snowflake — mirrors the Linktree logo shape */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" width={18} height={18}>
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
        </svg>
      </a>

      {/* Top-right: share button */}
      <button
        onClick={handleShare}
        aria-label="Share this page"
        className="
          fixed top-4 right-4 z-40
          w-10 h-10 rounded-full
          bg-white/95 shadow-sm
          flex items-center justify-center
          transition-transform hover:scale-105
        "
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}>
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>

      {/* Share modal */}
      {shareOpen && (
        <ShareModal
          username={username}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  );
}
