import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingSkeleton } from "./loading-skeleton";

describe("LoadingSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<LoadingSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with correct container height", () => {
    const { container } = render(<LoadingSkeleton />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("h-[calc(100vh-4rem)]");
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("overflow-hidden");
  });

  it("renders sidebar skeleton", () => {
    const { container } = render(<LoadingSkeleton />);

    const sidebar = container.querySelector("aside");
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass("w-72");
    expect(sidebar).toHaveClass("shrink-0");
    expect(sidebar).toHaveClass("border-r");
    expect(sidebar).toHaveClass("bg-card");
  });

  it("renders main content skeleton", () => {
    const { container } = render(<LoadingSkeleton />);

    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("flex-1");
    expect(main).toHaveClass("flex");
    expect(main).toHaveClass("flex-col");
    expect(main).toHaveClass("bg-background");
  });

  it("renders animated pulse elements in sidebar", () => {
    const { container } = render(<LoadingSkeleton />);

    const sidebar = container.querySelector("aside");
    const pulseContainer = sidebar?.querySelector(".animate-pulse");
    expect(pulseContainer).toBeInTheDocument();
  });

  it("renders animated pulse elements in main content", () => {
    const { container } = render(<LoadingSkeleton />);

    const main = container.querySelector("main");
    const pulseContainer = main?.querySelector(".animate-pulse");
    expect(pulseContainer).toBeInTheDocument();
  });

  it("renders multiple skeleton placeholder elements", () => {
    const { container } = render(<LoadingSkeleton />);

    const skeletonElements = container.querySelectorAll(".bg-muted");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("renders sidebar with border bottom on inner container", () => {
    const { container } = render(<LoadingSkeleton />);

    const sidebar = container.querySelector("aside");
    const innerContainer = sidebar?.querySelector(".border-b");
    expect(innerContainer).toBeInTheDocument();
    expect(innerContainer).toHaveClass("p-4");
  });

  it("renders skeleton elements with rounded corners", () => {
    const { container } = render(<LoadingSkeleton />);

    const roundedElements = container.querySelectorAll(".rounded");
    expect(roundedElements.length).toBeGreaterThan(0);
  });

  it("renders main content with padding", () => {
    const { container } = render(<LoadingSkeleton />);

    const main = container.querySelector("main");
    const paddedContainer = main?.querySelector(".p-6");
    expect(paddedContainer).toBeInTheDocument();
  });
});
