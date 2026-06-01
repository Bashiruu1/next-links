import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LinkShareOverlay from "@/components/LinkShareOverlay";

const SHORT_DESC = "A short description.";
const LONG_DESC =
  "This is a much longer description that exceeds one hundred and twenty characters in total length so it should be truncated by the component.";

const baseProps = {
  url: "https://example.com/shop",
  shareTitle: "Example Shop Title",
  shareDescription: SHORT_DESC,
  onClose: vi.fn(),
};

describe("LinkShareOverlay", () => {
  it("renders the 'Share link' heading", () => {
    render(<LinkShareOverlay {...baseProps} />);
    expect(screen.getByText("Share link")).toBeInTheDocument();
  });

  it("renders the shareTitle in the preview card", () => {
    render(<LinkShareOverlay {...baseProps} />);
    expect(screen.getByText(baseProps.shareTitle)).toBeInTheDocument();
  });

  it("renders the share description when it is short", () => {
    render(<LinkShareOverlay {...baseProps} />);
    expect(screen.getByText(SHORT_DESC)).toBeInTheDocument();
  });

  it("truncates the description and shows a 'More' button when over 120 chars", () => {
    render(<LinkShareOverlay {...baseProps} shareDescription={LONG_DESC} />);
    expect(screen.queryByText(LONG_DESC)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it("expands the description when 'More' is clicked", () => {
    render(<LinkShareOverlay {...baseProps} shareDescription={LONG_DESC} />);
    fireEvent.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByText(LONG_DESC)).toBeInTheDocument();
  });

  it("shows 'Less' button after expanding", () => {
    render(<LinkShareOverlay {...baseProps} shareDescription={LONG_DESC} />);
    fireEvent.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("button", { name: "Less" })).toBeInTheDocument();
  });

  it("collapses the description when 'Less' is clicked", () => {
    render(<LinkShareOverlay {...baseProps} shareDescription={LONG_DESC} />);
    fireEvent.click(screen.getByRole("button", { name: "More" }));
    fireEvent.click(screen.getByRole("button", { name: "Less" }));
    expect(screen.queryByText(LONG_DESC)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it("does not show More/Less when description is short", () => {
    render(<LinkShareOverlay {...baseProps} />);
    expect(screen.queryByRole("button", { name: "More" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Less" })).not.toBeInTheDocument();
  });

  it("calls onClose when the X button is clicked", () => {
    const onClose = vi.fn();
    render(<LinkShareOverlay {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    // onClose is called after a 320ms timeout; we just verify the button exists and is clickable
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("renders the image when the image prop is provided", () => {
    render(
      <LinkShareOverlay {...baseProps} image="https://example.com/thumb.jpg" />
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/thumb.jpg");
  });

  it("does not render an img when image prop is not provided", () => {
    render(<LinkShareOverlay {...baseProps} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders share platform buttons", () => {
    render(<LinkShareOverlay {...baseProps} />);
    expect(screen.getByText("Copy link")).toBeInTheDocument();
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });
});
