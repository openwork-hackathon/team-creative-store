import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PreviewToolbar } from "./preview-toolbar";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    className,
    title,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
    title?: string;
  }) => (
    <a href={to} className={className} title={title} data-testid="back-link">
      {children}
    </a>
  ),
}));

describe("PreviewToolbar", () => {
  it("renders back to marketplace link", () => {
    render(<PreviewToolbar />);

    const link = screen.getByTestId("back-link");
    expect(link).toHaveAttribute("href", "/market");
    expect(link).toHaveAttribute("title", "Back to Marketplace");
  });

  it("renders back arrow icon", () => {
    render(<PreviewToolbar />);

    expect(screen.getByText("arrow_back")).toBeInTheDocument();
  });

  it("renders grid toggle button", () => {
    render(<PreviewToolbar />);

    expect(screen.getByText("grid_4x4")).toBeInTheDocument();
    expect(screen.getByTitle("Toggle Grid")).toBeInTheDocument();
  });

  it("renders safety zones button", () => {
    render(<PreviewToolbar />);

    expect(screen.getByText("shield")).toBeInTheDocument();
    expect(screen.getByTitle("Safety Zones")).toBeInTheDocument();
  });

  it("renders zoom in button", () => {
    render(<PreviewToolbar />);

    expect(screen.getByText("zoom_in")).toBeInTheDocument();
    expect(screen.getByTitle("Zoom In")).toBeInTheDocument();
  });

  it("renders fullscreen button", () => {
    render(<PreviewToolbar />);

    expect(screen.getByText("fullscreen")).toBeInTheDocument();
    expect(screen.getByTitle("Fullscreen")).toBeInTheDocument();
  });

  it("renders zoom level indicator", () => {
    render(<PreviewToolbar />);

    expect(screen.getByText("Zoom: 65%")).toBeInTheDocument();
  });

  it("renders share preview button", () => {
    render(<PreviewToolbar />);

    expect(screen.getByText("share")).toBeInTheDocument();
    expect(screen.getByText("Share Preview")).toBeInTheDocument();
  });

  it("renders user avatars", () => {
    render(<PreviewToolbar />);

    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("+4")).toBeInTheDocument();
  });

  it("renders with sticky positioning", () => {
    const { container } = render(<PreviewToolbar />);

    const toolbar = container.firstChild;
    expect(toolbar).toHaveClass("sticky");
    expect(toolbar).toHaveClass("top-0");
    expect(toolbar).toHaveClass("z-10");
  });

  it("renders with correct background styling", () => {
    const { container } = render(<PreviewToolbar />);

    const toolbar = container.firstChild;
    expect(toolbar).toHaveClass("bg-card/50");
    expect(toolbar).toHaveClass("backdrop-blur-md");
  });

  it("renders grid button with primary styling (active state)", () => {
    render(<PreviewToolbar />);

    const gridButton = screen.getByTitle("Toggle Grid");
    expect(gridButton).toHaveClass("text-primary");
    expect(gridButton).toHaveClass("bg-primary/10");
  });

  it("renders other toolbar buttons with muted styling", () => {
    render(<PreviewToolbar />);

    const safetyButton = screen.getByTitle("Safety Zones");
    expect(safetyButton).toHaveClass("text-muted-foreground");
  });

  it("renders divider between toolbar buttons and zoom indicator", () => {
    const { container } = render(<PreviewToolbar />);

    const divider = container.querySelector(".w-px.h-6.bg-border");
    expect(divider).toBeInTheDocument();
  });

  it("renders share button with correct styling", () => {
    render(<PreviewToolbar />);

    const shareButton = screen.getByText("Share Preview").closest("button");
    expect(shareButton).toHaveClass("bg-muted");
    expect(shareButton).toHaveClass("border");
    expect(shareButton).toHaveClass("border-border");
  });
});
