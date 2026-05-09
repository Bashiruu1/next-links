import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TikTokCard from "@/components/TikTokCard";
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
  type: "card",
  platform: "tiktok",
  label: "TikTok",
  subtitle: "17.5K Followers",
  url: "https://www.tiktok.com/@sarah.rh.bashir",
};

describe("TikTokCard", () => {
  it("renders as a link to the card URL", () => {
    render(<TikTokCard item={item} theme={theme} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", item.url);
  });

  it("opens in a new tab with security attributes", () => {
    render(<TikTokCard item={item} theme={theme} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the label and subtitle in the card footer", () => {
    render(<TikTokCard item={item} theme={theme} />);
    expect(screen.getByText(item.label)).toBeInTheDocument();
    expect(screen.getByText(item.subtitle)).toBeInTheDocument();
  });

  it("renders the phone placeholder when no thumbnails or fallback image are provided", () => {
    render(<TikTokCard item={item} theme={theme} />);
    // PhonePlaceholder has no img elements
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders a fallback image when item.thumbnail is set and no resolvedThumbnails", () => {
    render(<TikTokCard item={{ ...item, thumbnail: "/thumb.jpg" }} theme={theme} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/thumb.jpg");
  });

  it("renders stacked thumbnail <img> elements when resolvedThumbnails are provided", () => {
    const thumbnails = [
      "https://cdn.tiktok.com/a.jpg",
      "https://cdn.tiktok.com/b.jpg",
      "https://cdn.tiktok.com/c.jpg",
    ];
    const { container } = render(
      <TikTokCard item={item} theme={theme} resolvedThumbnails={thumbnails} />
    );
    expect(container.querySelectorAll("img").length).toBe(3);
  });

  it("prefers resolvedThumbnails over item.thumbnail", () => {
    const thumbnails = ["https://cdn.tiktok.com/a.jpg", "https://cdn.tiktok.com/b.jpg"];
    const { container } = render(
      <TikTokCard
        item={{ ...item, thumbnail: "/fallback.jpg" }}
        theme={theme}
        resolvedThumbnails={thumbnails}
      />
    );
    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs.length).toBe(2);
    imgs.forEach((img) => expect(img).not.toHaveAttribute("src", "/fallback.jpg"));
  });

  it("applies the theme buttonBg as background-color", () => {
    render(<TikTokCard item={item} theme={theme} />);
    expect(screen.getByRole("link")).toHaveStyle({ backgroundColor: theme.buttonBg });
  });
});
