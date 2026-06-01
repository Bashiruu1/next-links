"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "@/config/links";
import {
  CopyIcon,
  CheckIcon,
  XShareIcon,
  FacebookShareIcon,
  WhatsAppShareIcon,
  LinkedInShareIcon,
  EmailShareIcon,
} from "@/components/ShareIcons";

interface LinkShareOverlayProps {
  url: string;
  image?: string;
  shareTitle?: string;
  shareDescription?: string;
  onClose: () => void;
}

type SharePlatform =
  | {
      id: string;
      label: string;
      icon: React.ReactNode;
      bg: string;
      color: string;
      kind: "link";
      href: (url: string) => string;
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

const DESCRIPTION_LIMIT = 120;

export default function LinkShareOverlay({
  url,
  image,
  shareTitle,
  shareDescription,
  onClose,
}: LinkShareOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const isLong = (shareDescription?.length ?? 0) > DESCRIPTION_LIMIT;
  const displayDescription = shareDescription
    ? isLong && !expanded
      ? shareDescription.slice(0, DESCRIPTION_LIMIT) + "…"
      : shareDescription
    : "";

  let domain = "";
  try {
    domain = new URL(url).hostname.replace("www.", "");
  } catch {
    domain = url;
  }

  // Lock body scroll while overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Trigger entrance animation on next frame
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
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
      href: (u) =>
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(`Check out ${config.profile.username}'s links!`)}`,
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
      href: (u) =>
        `https://wa.me/?text=${encodeURIComponent(`Check out ${config.profile.username}'s links! ${u}`)}`,
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
      href: (u) =>
        `mailto:?subject=${encodeURIComponent(`${config.profile.username}'s links`)}&body=${encodeURIComponent(u)}`,
    },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
        transition: "background-color 0.32s ease",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === overlayRef.current) close();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          transform: visible ? "scale(1)" : "scale(0.92)",
          opacity: visible ? 1 : 0,
          transition:
            "transform 0.28s cubic-bezier(0.32,0.72,0,1), opacity 0.28s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center relative px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Share link</h2>
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              width={14}
              height={14}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Link preview card */}
        <div className="px-6 pb-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden transition-all duration-200"
            onMouseEnter={() => setCardHovered(true)}
            onMouseLeave={() => setCardHovered(false)}
            style={shareTitle ? {
              transform: cardHovered ? "scale(1.02)" : "scale(1)",
              boxShadow: cardHovered ? "0 8px 32px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
            } : {
              backgroundColor: config.theme.buttonBg,
              transform: cardHovered ? "scale(1.02)" : "scale(1)",
              boxShadow: cardHovered ? "0 8px 32px rgba(0,0,0,0.25)" : "0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            {shareTitle ? (
              /* Horizontal layout — ButtonLink with title + description */
              <div className="flex gap-4 bg-gray-50 p-5">
                {image && (
                  <img
                    src={image}
                    alt={shareTitle}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-gray-900 text-lg leading-snug">
                    {shareTitle}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5 truncate">
                    {domain}
                  </span>
                  {shareDescription && (
                    <span className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      {displayDescription}
                      {isLong && (
                        <button
                          type="button"
                          className="text-xs font-medium text-gray-900 underline underline-offset-2 ml-1"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpanded((v) => !v);
                          }}
                        >
                          {expanded ? "Less" : "More"}
                        </button>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Stacked layout — SocialPillLink with image + URL only */
              <>
                {image && (
                  <div className="flex justify-center pt-6 pb-4 px-6">
                    <img
                      src={image}
                      alt={domain}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  </div>
                )}
                <div className="px-5 pb-5 text-center">
                  <p className="text-xs truncate" style={{ color: config.theme.subtextColor }}>
                    {domain}
                  </p>
                </div>
              </>
            )}
          </a>
        </div>

        {/* Share platforms row */}
        <div className="px-6 pb-8 overflow-x-auto">
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
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-1.5 min-w-[56px]"
                >
                  {p.kind === "action" ? (
                    <button
                      type="button"
                      onClick={() => p.onClick(pageUrl)}
                      className="cursor-pointer"
                    >
                      {iconCircle}
                    </button>
                  ) : (
                    <a
                      href={p.href(pageUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {iconCircle}
                    </a>
                  )}
                  <span className="text-xs text-gray-600 text-center">
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
