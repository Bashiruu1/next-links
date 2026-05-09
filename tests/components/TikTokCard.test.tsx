import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TikTokCard from "@/components/TikTokCard";
import { LinkType } from "@/config/links";
import type { CardLink, SiteConfig } from "@/config/links";

const theme: SiteConfig["theme"] = {
  background: "#3A2218",
  gridColor: "rgba(200,160,120,0.10)",
  buttonBg: "#7D6452",
  buttonText: "#FFFFFF",
  textColor: "#FFFFFF",
  subtextColor: "#C8B09A",
};

const item: CardLink = {
  type: LinkType.Card,
  platform: "tiktok",
  label: "TikTok",
  followerCount: 17500,
  url: "https://www.tiktok.com/@sarah.rh.bashir",
};

const subtitle = "17.5K Followers";

describe("TikTokCard", () => {
  it("renders as a link to the card URL inside the modal", () => {
    render(<TikTokCard item={item} theme={theme} subtitle={subtitle} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("link", { name: /Follow on TikTok/i })).toHaveAttribute("href", item.url);
  });

  it("opens in a new tab with security attributes", () => {
    render(<TikTokCard item={item} theme={theme} subtitle={subtitle} />);
    fireEvent.click(screen.getByRole("button"));
    const link = screen.getByRole("link", { name: /Follow on TikTok/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the label and subtitle in the card footer", () => {
    render(<TikTokCard item={item} theme={theme} subtitle={subtitle} />);
    expect(screen.getByText(item.label)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it("renders the phone placeholder when no thumbnails or fallback image are provided", () => {
    render(<TikTokCard item={item} theme={theme} subtitle={subtitle} />);
    // PhonePlaceholder has no img elements
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders a fallback image when item.thumbnail is set and no resolvedThumbnails", () => {
    render(<TikTokCard item={{ ...item, thumbnail: "/thumb.jpg" }} theme={theme} subtitle={subtitle} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/thumb.jpg");
  });

  it("renders stacked thumbnail <img> elements when resolvedThumbnails are provided", () => {
    const thumbnails = [
      "https://cdn.tiktok.com/a.jpg",
      "https://cdn.tiktok.com/b.jpg",
      "https://cdn.tiktok.com/c.jpg",
    ];
    const { container } = render(
      <TikTokCard item={item} theme={theme} subtitle={subtitle} resolvedThumbnails={thumbnails} />
    );
    expect(container.querySelectorAll("img").length).toBe(3);
  });

  it("prefers resolvedThumbnails over item.thumbnail", () => {
    const thumbnails = ["https://cdn.tiktok.com/a.jpg", "https://cdn.tiktok.com/b.jpg"];
    const { container } = render(
      <TikTokCard
        item={{ ...item, thumbnail: "/fallback.jpg" }}
        theme={theme}
        subtitle={subtitle}
        resolvedThumbnails={thumbnails}
      />
    );
    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs.length).toBe(2);
    imgs.forEach((img) => expect(img).not.toHaveAttribute("src", "/fallback.jpg"));
  });

  it("applies the theme buttonBg as background-color", () => {
    render(<TikTokCard item={item} theme={theme} subtitle={subtitle} />);
    expect(screen.getByRole("button")).toHaveStyle({ backgroundColor: theme.buttonBg });
  });
});
