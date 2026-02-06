import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PurchaseCard } from "./purchase-card";
import type { MarketListing } from "./types";

const mockListing: MarketListing = {
  id: "listing-123",
  title: "Premium Creative Asset",
  description: "A beautiful creative design",
  imageUrl: "https://example.com/creative.jpg",
  priceAicc: "250",
  isPremium: false,
};

const mockPremiumListing: MarketListing = {
  ...mockListing,
  isPremium: true,
};

describe("PurchaseCard", () => {
  it("renders the listing title", () => {
    render(<PurchaseCard listing={mockListing} />);

    expect(screen.getByText("Premium Creative Asset")).toBeInTheDocument();
  });

  it("renders Creative Asset label for non-premium listings", () => {
    render(<PurchaseCard listing={mockListing} />);

    expect(screen.getByText("Creative Asset")).toBeInTheDocument();
  });

  it("renders Premium Assets label for premium listings", () => {
    render(<PurchaseCard listing={mockPremiumListing} />);

    expect(screen.getByText("Premium Assets")).toBeInTheDocument();
  });

  it("renders current price label", () => {
    render(<PurchaseCard listing={mockListing} />);

    expect(screen.getByText("Current Price")).toBeInTheDocument();
  });

  it("renders price in AICC", () => {
    render(<PurchaseCard listing={mockListing} />);

    expect(screen.getByText("250.00")).toBeInTheDocument();
    expect(screen.getByText("AICC")).toBeInTheDocument();
  });

  it("renders USD equivalent price", () => {
    render(<PurchaseCard listing={mockListing} />);

    // 250 * 2.76 = 690
    expect(screen.getByText("≈ $690.00")).toBeInTheDocument();
  });

  it("renders buy now button", () => {
    render(<PurchaseCard listing={mockListing} />);

    expect(screen.getByRole("button", { name: "Buy Now" })).toBeInTheDocument();
  });

  it("renders certified creator badge", () => {
    render(<PurchaseCard listing={mockListing} />);

    expect(screen.getByText("verified")).toBeInTheDocument();
    expect(screen.getByText("Certified Creator")).toBeInTheDocument();
  });

  it("renders royalty percentage", () => {
    render(<PurchaseCard listing={mockListing} />);

    expect(screen.getByText("5.0% Royalty")).toBeInTheDocument();
  });

  it("renders database icon for price", () => {
    render(<PurchaseCard listing={mockListing} />);

    expect(screen.getByText("database")).toBeInTheDocument();
  });

  it("renders buy button with primary styling", () => {
    render(<PurchaseCard listing={mockListing} />);

    const buyButton = screen.getByRole("button", { name: "Buy Now" });
    expect(buyButton).toHaveClass("bg-primary");
    expect(buyButton).toHaveClass("text-primary-foreground");
    expect(buyButton).toHaveClass("font-bold");
  });

  it("renders with correct card structure", () => {
    const { container } = render(<PurchaseCard listing={mockListing} />);

    const card = container.querySelector(".bg-card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("rounded-xl");
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("border-border");
  });

  it("handles numeric priceAicc", () => {
    const listingWithNumericPrice: MarketListing = {
      ...mockListing,
      priceAicc: 100,
    };
    render(<PurchaseCard listing={listingWithNumericPrice} />);

    expect(screen.getByText("100.00")).toBeInTheDocument();
    // 100 * 2.76 = 276
    expect(screen.getByText("≈ $276.00")).toBeInTheDocument();
  });

  it("renders price section with border", () => {
    const { container } = render(<PurchaseCard listing={mockListing} />);

    const priceSection = container.querySelector(".border-y");
    expect(priceSection).toBeInTheDocument();
    expect(priceSection).toHaveClass("border-border");
  });

  it("renders asset type label with primary color", () => {
    render(<PurchaseCard listing={mockListing} />);

    const label = screen.getByText("Creative Asset");
    expect(label).toHaveClass("text-primary");
    expect(label).toHaveClass("uppercase");
    expect(label).toHaveClass("tracking-widest");
  });
});
