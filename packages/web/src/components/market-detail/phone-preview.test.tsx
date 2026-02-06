import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PhonePreview } from "./phone-preview";
import type { MarketListing } from "./types";

const mockListing: MarketListing = {
  id: "listing-123",
  title: "Premium Creative Asset",
  description: "A beautiful creative design for your campaigns",
  imageUrl: "https://example.com/creative.jpg",
  priceAicc: "250",
  isPremium: false,
};

const mockPremiumListing: MarketListing = {
  ...mockListing,
  isPremium: true,
};

describe("PhonePreview", () => {
  it("renders the listing title", () => {
    render(<PhonePreview listing={mockListing} />);

    expect(screen.getByText("Premium Creative Asset")).toBeInTheDocument();
  });

  it("renders the listing description", () => {
    render(<PhonePreview listing={mockListing} />);

    expect(
      screen.getByText("A beautiful creative design for your campaigns")
    ).toBeInTheDocument();
  });

  it("renders CREATIVE badge for non-premium listings", () => {
    render(<PhonePreview listing={mockListing} />);

    expect(screen.getByText("CREATIVE")).toBeInTheDocument();
  });

  it("renders NFT EXCLUSIVE badge for premium listings", () => {
    render(<PhonePreview listing={mockPremiumListing} />);

    expect(screen.getByText("NFT EXCLUSIVE")).toBeInTheDocument();
  });

  it("renders purchase license button", () => {
    render(<PhonePreview listing={mockListing} />);

    expect(screen.getByText("PURCHASE LICENSE")).toBeInTheDocument();
  });

  it("renders availability indicator", () => {
    render(<PhonePreview listing={mockListing} />);

    expect(screen.getByText("Available on Marketplace")).toBeInTheDocument();
  });

  it("renders favorite icon", () => {
    render(<PhonePreview listing={mockListing} />);

    expect(screen.getByText("favorite")).toBeInTheDocument();
  });

  it("renders safe zone indicator", () => {
    render(<PhonePreview listing={mockListing} />);

    expect(screen.getByText("Social Safe Zone")).toBeInTheDocument();
  });

  it("renders background image from listing", () => {
    const { container } = render(<PhonePreview listing={mockListing} />);

    const bgElement = container.querySelector(
      '[style*="background-image"]'
    ) as HTMLElement;
    expect(bgElement).toBeInTheDocument();
    expect(bgElement.style.backgroundImage).toContain(
      "https://example.com/creative.jpg"
    );
  });

  it("renders phone frame with correct dimensions", () => {
    const { container } = render(<PhonePreview listing={mockListing} />);

    const phoneFrame = container.querySelector(
      '[style*="width: 400px"]'
    ) as HTMLElement;
    expect(phoneFrame).toBeInTheDocument();
    expect(phoneFrame.style.height).toBe("820px");
  });

  it("renders phone notch", () => {
    const { container } = render(<PhonePreview listing={mockListing} />);

    const notch = container.querySelector(".rounded-b-3xl");
    expect(notch).toBeInTheDocument();
  });

  it("handles listing without description", () => {
    const listingWithoutDesc: MarketListing = {
      ...mockListing,
      description: null,
    };
    render(<PhonePreview listing={listingWithoutDesc} />);

    // Should render without crashing
    expect(screen.getByText("Premium Creative Asset")).toBeInTheDocument();
    expect(
      screen.queryByText("A beautiful creative design for your campaigns")
    ).not.toBeInTheDocument();
  });

  it("renders with grid background pattern", () => {
    const { container } = render(<PhonePreview listing={mockListing} />);

    const gridContainer = container.querySelector(
      '[style*="background-size: 40px 40px"]'
    );
    expect(gridContainer).toBeInTheDocument();
  });

  it("renders phone frame with shadow", () => {
    const { container } = render(<PhonePreview listing={mockListing} />);

    const phoneFrame = container.querySelector(".shadow-\\[0_0_100px_rgba\\(0\\,0\\,0\\,0\\.3\\)\\]");
    expect(phoneFrame).toBeInTheDocument();
  });

  it("renders gradient overlay", () => {
    const { container } = render(<PhonePreview listing={mockListing} />);

    const gradient = container.querySelector(".bg-gradient-to-t");
    expect(gradient).toBeInTheDocument();
  });
});
