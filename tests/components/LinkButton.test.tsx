import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LinkButton from "@/components/LinkButton";
import { LinkType } from "@/config/links";
import type { ButtonLink, SiteConfig } from "@/config/links";

const theme: SiteConfig["theme"] = {
  background: "#3A2218",
  gridColor: "rgba(200,160,120,0.10)",
  buttonBg: "#7D6452",
  buttonText: "#FFFFFF",
  textColor: "#FFFFFF",
  subtextColor: "#C8B09A",
};

const item: ButtonLink = {
  type: LinkType.Button,
  label: "Shop gluten-free ice cream treats by 10% off",
  url: "https://example.com/shop",
};

describe("LinkButton", () => {
  it("renders the label text", () => {
    render(<LinkButton item={item} theme={theme} />);
    expect(screen.getByText(item.label)).toBeInTheDocument();
  });

  it("renders an anchor with the correct href", () => {
    render(<LinkButton item={item} theme={theme} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", item.url);
  });

  it("opens in a new tab", () => {
    render(<LinkButton item={item} theme={theme} />);
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
  });

  it("has rel=noopener noreferrer for security", () => {
    render(<LinkButton item={item} theme={theme} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    );
  });

  it("applies the theme buttonBg as background-color", () => {
    const { container } = render(<LinkButton item={item} theme={theme} />);
    expect(container.firstChild).toHaveStyle({ backgroundColor: theme.buttonBg });
  });

  it("applies the theme buttonText as color", () => {
    render(<LinkButton item={item} theme={theme} />);
    expect(screen.getByRole("link")).toHaveStyle({ color: theme.buttonText });
  });

  it("renders the three-dot menu indicator SVG", () => {
    const { container } = render(<LinkButton item={item} theme={theme} />);
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(3);
  });

  it("does not render a follower count when followerCount is not set", () => {
    render(<LinkButton item={item} theme={theme} />);
    expect(screen.queryByText(/Followers/)).not.toBeInTheDocument();
  });

  it("renders a formatted follower count when followerCount is set", () => {
    render(<LinkButton item={{ ...item, followerCount: 5200 }} theme={theme} />);
    expect(screen.getByText("5.2K Followers")).toBeInTheDocument();
  });
});
