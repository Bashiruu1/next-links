import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TopBar from "@/components/TopBar";

const defaultProps = {
  username: "sarah.rh.bashir",
  repoUrl: "https://github.com/test/next-links",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("TopBar", () => {
  it("renders the logo link pointing to repoUrl", () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByLabelText("next-links — get your own page")).toHaveAttribute(
      "href",
      defaultProps.repoUrl
    );
  });

  it("renders the share button", () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByLabelText("Share this page")).toBeInTheDocument();
  });

  it("opens the share modal when navigator.share is unavailable", async () => {
    // jsdom does not define navigator.share — no stub needed
    render(<TopBar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Share this page"));
    await waitFor(() => {
      expect(screen.getByText("Share link")).toBeInTheDocument();
    });
  });

  it("uses native share when navigator.share is available", async () => {
    vi.stubGlobal("navigator", {
      ...window.navigator,
      share: vi.fn().mockResolvedValue(undefined),
    });
    render(<TopBar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Share this page"));
    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalled();
    });
    expect(screen.queryByText("Share link")).not.toBeInTheDocument();
  });

  it("falls back to the share modal when navigator.share throws (user cancelled)", async () => {
    vi.stubGlobal("navigator", {
      ...window.navigator,
      share: vi.fn().mockRejectedValue(new DOMException("cancelled", "AbortError")),
    });
    render(<TopBar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Share this page"));
    await waitFor(() => {
      expect(screen.getByText("Share link")).toBeInTheDocument();
    });
  });

  it("closes the share modal when onClose is triggered", async () => {
    render(<TopBar {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Share this page"));
    await waitFor(() => screen.getByText("Share link"));
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByText("Share link")).not.toBeInTheDocument();
    });
  });
});
