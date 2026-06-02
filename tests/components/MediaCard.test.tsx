import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MediaCard from "@/components/MediaCard";
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

describe("MediaCard", () => {
  it("renders a modal follow link for platform cards", () => {
    render(<MediaCard item={item} theme={theme} subtitle={subtitle} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.getByRole("link", { name: /Follow on TikTok/i })).toHaveAttribute("href", item.url);
  });

  it("follow link opens in a new tab with security attributes", () => {
    render(<MediaCard item={item} theme={theme} subtitle={subtitle} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    const link = screen.getByRole("link", { name: /Follow on TikTok/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the label and subtitle in the card footer", () => {
    render(<MediaCard item={item} theme={theme} subtitle={subtitle} />);
    expect(screen.getByText(item.label)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it("renders nothing in the image area when no thumbnails, fallback image, or videos are provided", () => {
    render(<MediaCard item={item} theme={theme} subtitle={subtitle} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the phone placeholder when videos are specified but not yet resolved", () => {
    const itemWithVideos: CardLink = { ...item, videos: ["https://www.tiktok.com/@x/video/1"] };
    render(<MediaCard item={itemWithVideos} theme={theme} subtitle={subtitle} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders a fallback image when item.thumbnail is set and no resolvedThumbnails", () => {
    render(<MediaCard item={{ ...item, thumbnail: "/thumb.jpg" }} theme={theme} subtitle={subtitle} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/thumb.jpg");
  });

  it("renders stacked thumbnail <img> elements when resolvedThumbnails are provided", () => {
    const thumbnails = [
      "https://cdn.tiktok.com/a.jpg",
      "https://cdn.tiktok.com/b.jpg",
      "https://cdn.tiktok.com/c.jpg",
    ];
    const { container } = render(
      <MediaCard item={item} theme={theme} subtitle={subtitle} resolvedThumbnails={thumbnails} />
    );
    expect(container.querySelectorAll("img").length).toBe(3);
  });

  it("prefers resolvedThumbnails over item.thumbnail", () => {
    const thumbnails = ["https://cdn.tiktok.com/a.jpg", "https://cdn.tiktok.com/b.jpg"];
    const { container } = render(
      <MediaCard
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
    const { container } = render(<MediaCard item={item} theme={theme} subtitle={subtitle} />);
    expect(container.firstChild).toHaveStyle({ backgroundColor: theme.buttonBg });
  });

  it("renders as a direct link when no platform is set", () => {
    const genericItem: CardLink = { type: LinkType.Card, label: "Roadmap", url: "./roadmap.html" };
    render(<MediaCard item={genericItem} theme={theme} subtitle="" />);
    const links = screen.getAllByRole("link");
    expect(links.some(l => l.getAttribute("href") === "./roadmap.html")).toBe(true);
  });

  it("does not open a modal for no-platform cards", () => {
    const genericItem: CardLink = { type: LinkType.Card, label: "Roadmap", url: "./roadmap.html" };
    render(<MediaCard item={genericItem} theme={theme} subtitle="" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
