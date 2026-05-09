import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PlatformIcon } from "@/components/SocialIcons";
import type { SocialPlatform } from "@/config/links";

const platforms: SocialPlatform[] = [
  "instagram",
  "tiktok",
  "twitter",
  "youtube",
  "facebook",
  "linkedin",
  "github",
  "website",
];

describe("PlatformIcon", () => {
  it.each(platforms)("renders an SVG for platform '%s'", (platform) => {
    const { container } = render(<PlatformIcon platform={platform} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders distinct SVGs for different platforms", () => {
    const { container: ig } = render(<PlatformIcon platform="instagram" />);
    const { container: gh } = render(<PlatformIcon platform="github" />);
    expect(ig.innerHTML).not.toBe(gh.innerHTML);
  });
});
