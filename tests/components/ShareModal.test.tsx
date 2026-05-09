import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ShareModal from "@/components/ShareModal";

const defaultProps = {
  username: "sarah.rh.bashir",
  repoUrl: "https://github.com/test/next-links",
  onClose: vi.fn(),
};

function stubClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(window.navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
}

/** The "Copy link" label is a sibling <span> outside the <button>. Click the button itself. */
function getCopyButton() {
  return screen
    .getAllByRole("button")
    .find((b) => b.getAttribute("aria-label") !== "Close")!;
}

beforeEach(() => {
  stubClipboard(vi.fn().mockResolvedValue(undefined));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("ShareModal", () => {
  it("renders the share modal heading", () => {
    render(<ShareModal {...defaultProps} />);
    expect(screen.getByText("Share link")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<ShareModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape is pressed", () => {
    render(<ShareModal {...defaultProps} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked directly", () => {
    const { container } = render(<ShareModal {...defaultProps} />);
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose when clicking inside the modal card", () => {
    render(<ShareModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Share link"));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("calls clipboard.writeText when the copy button is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<ShareModal {...defaultProps} />);
    fireEvent.click(getCopyButton());
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });
  });

  it("shows 'Copied!' after a successful copy", async () => {
    render(<ShareModal {...defaultProps} />);
    fireEvent.click(getCopyButton());
    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it("does not throw when clipboard.writeText rejects", () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("Not allowed")));
    render(<ShareModal {...defaultProps} />);
    expect(() => fireEvent.click(getCopyButton())).not.toThrow();
  });

  it("traps body scroll while open and restores it on unmount", () => {
    const { unmount } = render(<ShareModal {...defaultProps} />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("renders the CTA section with the username", () => {
    render(<ShareModal {...defaultProps} />);
    expect(
      screen.getByText(`Join @${defaultProps.username} on next-links`)
    ).toBeInTheDocument();
  });

  it("renders a 'Get it on GitHub' link pointing to repoUrl", () => {
    render(<ShareModal {...defaultProps} />);
    const link = screen.getByText("Get it on GitHub").closest("a");
    expect(link).toHaveAttribute("href", defaultProps.repoUrl);
  });
});
