import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileHeader from "@/components/ProfileHeader";
import type { SiteConfig } from "@/config/links";

const profile: SiteConfig["profile"] = {
  name: "Sarah Bashir",
  bio: "Creating our dream life, one brick at a time! 🏠✨",
  avatar: "/avatar.svg",
  username: "sarah.rh.bashir",
};

const theme: SiteConfig["theme"] = {
  background: "#3A2218",
  gridColor: "rgba(200,160,120,0.10)",
  buttonBg: "#7D6452",
  buttonText: "#FFFFFF",
  textColor: "#FFFFFF",
  subtextColor: "#C8B09A",
};

const socials: SiteConfig["socials"] = [
  { platform: "instagram", url: "https://instagram.com/sarah.rh.bashir" },
  { platform: "tiktok", url: "https://tiktok.com/@sarah.rh.bashir" },
];

describe("ProfileHeader", () => {
  it("renders the profile name as an h1", () => {
    render(<ProfileHeader profile={profile} socials={socials} theme={theme} />);
    expect(
      screen.getByRole("heading", { level: 1, name: profile.name })
    ).toBeInTheDocument();
  });

  it("renders the bio text", () => {
    render(<ProfileHeader profile={profile} socials={socials} theme={theme} />);
    expect(screen.getByText(profile.bio)).toBeInTheDocument();
  });

  it("renders the avatar image with alt text matching the name", () => {
    render(<ProfileHeader profile={profile} socials={socials} theme={theme} />);
    const img = screen.getByRole("img", { name: profile.name });
    expect(img).toHaveAttribute("src", profile.avatar);
  });

  it("renders a social icon link for each social entry", () => {
    render(<ProfileHeader profile={profile} socials={socials} theme={theme} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(socials.length);
  });

  it("social links point to the correct URLs", () => {
    render(<ProfileHeader profile={profile} socials={socials} theme={theme} />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    socials.forEach((s) => expect(hrefs).toContain(s.url));
  });

  it("social links open in a new tab with security attributes", () => {
    render(<ProfileHeader profile={profile} socials={socials} theme={theme} />);
    screen.getAllByRole("link").forEach((link: HTMLElement) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("renders no social links when the socials array is empty", () => {
    render(<ProfileHeader profile={profile} socials={[]} theme={theme} />);
    expect(screen.queryAllByRole("link").length).toBe(0);
  });

  it("applies textColor to the name heading", () => {
    render(<ProfileHeader profile={profile} socials={socials} theme={theme} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveStyle({ color: theme.textColor });
  });

  it("applies subtextColor to the bio paragraph", () => {
    render(<ProfileHeader profile={profile} socials={socials} theme={theme} />);
    const bio = screen.getByText(profile.bio);
    expect(bio).toHaveStyle({ color: theme.subtextColor });
  });
});
