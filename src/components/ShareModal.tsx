"use client";

import { useEffect, useRef, useState } from "react";
import {
  CopyIcon,
  CheckIcon,
  XShareIcon,
  FacebookShareIcon,
  WhatsAppShareIcon,
  LinkedInShareIcon,
  EmailShareIcon,
} from "./ShareIcons";

interface ShareModalProps {
  username: string;
  onClose: () => void;
}

// Each platform is either a link (opens a URL) or an action (runs a callback).
// Keeping them in a single discriminated type makes it easy to add or remove platforms.
type SharePlatform =
  | {
      id: string;
      label: string;
      icon: React.ReactNode;
      bg: string;
      color: string;
      kind: "link";
      href: (url: string, username: string) => string;
    }
  | {
      id: string;
      label: string;
      icon: React.ReactNode;
      bg: string;
      color: string;
      kind: "action";
      onClick: (url: string) => void;
    };

export default function ShareModal({ username, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const url = typeof window !== "undefined" ? window.location.href : "";

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Trap scroll behind modal
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (HTTP context, permissions denied, unsupported browser)
    }
  }

  const platforms: SharePlatform[] = [
    {
      id: "copy",
      label: copied ? "Copied!" : "Copy link",
      icon: copied ? <CheckIcon /> : <CopyIcon />,
      bg: copied ? "#22c55e" : "#e5e7eb",
      color: copied ? "#fff" : "#111",
      kind: "action",
      onClick: () => handleCopy(),
    },
    {
      id: "x",
      label: "X",
      icon: <XShareIcon />,
      bg: "#000",
      color: "#fff",
      kind: "link",
      href: (u, name) =>
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(`Check out ${name}'s links!`)}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: <FacebookShareIcon />,
      bg: "#1877f2",
      color: "#fff",
      kind: "link",
      href: (u) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppShareIcon />,
      bg: "#25D366",
      color: "#fff",
      kind: "link",
      href: (u, name) =>
        `https://wa.me/?text=${encodeURIComponent(`Check out ${name}'s links! ${u}`)}`,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: <LinkedInShareIcon />,
      bg: "#0a66c2",
      color: "#fff",
      kind: "link",
      href: (u) =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
    },
    {
      id: "email",
      label: "Email",
      icon: <EmailShareIcon />,
      bg: "#6b7280",
      color: "#fff",
      kind: "link",
      href: (u, name) =>
        `mailto:?subject=${encodeURIComponent(`${name}'s links`)}&body=${encodeURIComponent(u)}`,
    },
  ];

  return (
    /* Backdrop */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center relative px-6 pt-6 pb-4">
          <h2 className="text-base font-semibold text-gray-900">Share link</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={14} height={14}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Platform icons row — each item is a proper <a> or <button>, never nested */}
        <div className="px-6 pb-4 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {platforms.map((p) => {
              const iconCircle = (
                <span
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                  style={{ backgroundColor: p.bg, color: p.color }}
                >
                  {p.icon}
                </span>
              );

              return (
                <div key={p.id} className="flex flex-col items-center gap-1.5 min-w-[56px]">
                  {p.kind === "action" ? (
                    <button onClick={() => p.onClick(url)} className="cursor-pointer">
                      {iconCircle}
                    </button>
                  ) : (
                    <a
                      href={p.href(url, username)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {iconCircle}
                    </a>
                  )}
                  <span className="text-xs text-gray-600 text-center">{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
