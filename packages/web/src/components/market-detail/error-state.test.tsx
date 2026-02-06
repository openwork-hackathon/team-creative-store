import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "./error-state";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid="back-link">
      {children}
    </a>
  ),
}));

describe("ErrorState", () => {
  it("renders error icon", () => {
    render(<ErrorState />);

    expect(screen.getByText("error")).toBeInTheDocument();
  });

  it("renders error title", () => {
    render(<ErrorState />);

    expect(screen.getByText("Listing Not Found")).toBeInTheDocument();
  });

  it("renders error description", () => {
    render(<ErrorState />);

    expect(
      screen.getByText(
        "The creative listing you're looking for doesn't exist or has been removed."
      )
    ).toBeInTheDocument();
  });

  it("renders back to marketplace link", () => {
    render(<ErrorState />);

    const link = screen.getByTestId("back-link");
    expect(link).toHaveAttribute("href", "/market");
  });

  it("renders back arrow icon in link", () => {
    render(<ErrorState />);

    expect(screen.getByText("arrow_back")).toBeInTheDocument();
  });

  it("renders link text", () => {
    render(<ErrorState />);

    expect(screen.getByText("Back to Marketplace")).toBeInTheDocument();
  });

  it("renders with correct container styling", () => {
    const { container } = render(<ErrorState />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("h-[calc(100vh-4rem)]");
    expect(wrapper).toHaveClass("items-center");
    expect(wrapper).toHaveClass("justify-center");
  });

  it("renders error card with dashed border", () => {
    render(<ErrorState />);

    const errorCard = screen.getByText("Listing Not Found").closest("div");
    const cardContainer = errorCard?.parentElement;
    expect(cardContainer).toHaveClass("border-2");
    expect(cardContainer).toHaveClass("border-dashed");
    expect(cardContainer).toHaveClass("border-border");
  });

  it("renders icon container with muted background", () => {
    render(<ErrorState />);

    const iconContainer = screen.getByText("error").closest("div");
    expect(iconContainer).toHaveClass("bg-muted");
    expect(iconContainer).toHaveClass("rounded-full");
  });

  it("renders link with primary button styling", () => {
    render(<ErrorState />);

    const link = screen.getByTestId("back-link");
    expect(link).toHaveClass("bg-primary");
    expect(link).toHaveClass("text-primary-foreground");
    expect(link).toHaveClass("rounded-lg");
  });
});
