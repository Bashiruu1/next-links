import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SocialPill from "@/components/SocialPill";
import type { SocialPillLink, SiteConfig } from "@/config/links";

const theme: SiteConfig["theme"] = {
  background: "#3A2218",
  gridColor: "rgba(200,160,120,0.10)",
  buttonBg: "#7D6452",
  buttonText: "#FFFFFF",
  textColor: "#FFFFFF",
  subtextColor: "#C8B09A",
};

const item: SocialPillLink = {
  type: "social",
  platform: "instagram",
  label: "Instagram",
  avatar: "/avatar.svg",
  url: "https://instagram.com/sarah.rh.bashir",
};

describe("SocialPill", () => {
  it("renders the label", () => {
    render(<SocialPill item={item} theme={theme} />);
    expect(screen.getByText("Instagram")).toBeInTheDocument();
  });

  it("links to the correct URL", () => {
    render(<SocialPill item={item} theme={theme} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", item.url);
  });

  it("opens in a new tab with security attributes", () => {
    render(<SocialPill item={item} theme={theme} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders an avatar image when the avatar prop is provided", () => {
    render(<SocialPill item={item} theme={theme} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/avatar.svg");
  });

  it("does not render an avatar image when avatar is omitted", () => {
    const noAvatarItem: SocialPillLink = { ...item, avatar: undefined };
    render(<SocialPill item={noAvatarItem} theme={theme} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("does not render an avatar image when avatar is an empty string", () => {
    const noAvatarItem: SocialPillLink = { ...item, avatar: "" };
    render(<SocialPill item={noAvatarItem} theme={theme} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("applies the theme buttonBg as background-color", () => {
    render(<SocialPill item={item} theme={theme} />);
    expect(screen.getByRole("link")).toHaveStyle({
      backgroundColor: theme.buttonBg,
    });
  });
});
