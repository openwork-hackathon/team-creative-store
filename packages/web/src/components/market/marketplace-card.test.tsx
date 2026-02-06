import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarketplaceCard } from "./marketplace-card";
import type { MarketplaceListing } from "@/lib/api";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params, className }: { children: React.ReactNode; to: string; params: Record<string, string>; className?: string }) => (
    <a href={`${to.replace("$id", params.id)}`} className={className} data-testid="marketplace-link">
      {children}
    </a>
  )
}));

const mockListing: MarketplaceListing = {
  id: "listing-123",
  title: "Premium Banner Design",
  description: "A beautiful banner design for your campaigns",
  imageUrl: "https://example.com/image.jpg",
  creatorId: "creator-456",
  creator: { id: "creator-456", name: "John Designer" },
  priceAicc: "250",
  assetType: "image",
  licenseType: "commercial",
  rating: "4.8",
  reviewCount: 42,
  isPremium: false,
  tags: ["banner", "design", "marketing"],
  status: "active",
  createdAt: "2026-01-15T10:00:00Z"
};

describe("MarketplaceCard", () => {
  it("renders the listing title", () => {
    render(<MarketplaceCard listing={mockListing} />);
    expect(screen.getByText("Premium Banner Design")).toBeInTheDocument();
  });

  it("renders the creator name", () => {
    render(<MarketplaceCard listing={mockListing} />);
    expect(screen.getByText("John Designer")).toBeInTheDocument();
  });

  it("renders the price in AICC", () => {
    render(<MarketplaceCard listing={mockListing} />);
    expect(screen.getByText("250 AICC")).toBeInTheDocument();
  });

  it("renders the rating", () => {
    render(<MarketplaceCard listing={mockListing} />);
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("links to the correct detail page", () => {
    render(<MarketplaceCard listing={mockListing} />);
    const link = screen.getByTestId("marketplace-link");
    expect(link).toHaveAttribute("href", "/market/listing-123");
  });

  it("does not show Premium badge for non-premium listings", () => {
    render(<MarketplaceCard listing={mockListing} />);
    expect(screen.queryByText("Premium")).not.toBeInTheDocument();
  });

  it("shows Premium badge for premium listings", () => {
    const premiumListing = { ...mockListing, isPremium: true };
    render(<MarketplaceCard listing={premiumListing} />);
    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("renders the background image", () => {
    render(<MarketplaceCard listing={mockListing} />);
    const imageDiv = document.querySelector('[style*="background-image"]');
    expect(imageDiv).toHaveStyle({ backgroundImage: 'url("https://example.com/image.jpg")' });
  });

  it("renders 'View Details' hover text", () => {
    render(<MarketplaceCard listing={mockListing} />);
    expect(screen.getByText("View Details")).toBeInTheDocument();
  });

  it("handles listing with null creator name", () => {
    const listingWithNullCreator = {
      ...mockListing,
      creator: { id: "creator-456", name: null }
    };
    render(<MarketplaceCard listing={listingWithNullCreator} />);
    // Should render without crashing
    expect(screen.getByText("Premium Banner Design")).toBeInTheDocument();
  });

  it("handles listing with null description", () => {
    const listingWithNullDesc = {
      ...mockListing,
      description: null
    };
    render(<MarketplaceCard listing={listingWithNullDesc} />);
    // Should render without crashing
    expect(screen.getByText("Premium Banner Design")).toBeInTheDocument();
  });

  it("renders with correct card structure", () => {
    render(<MarketplaceCard listing={mockListing} />);
    const link = screen.getByTestId("marketplace-link");
    expect(link).toHaveClass("group");
    expect(link).toHaveClass("rounded-xl");
    expect(link).toHaveClass("border");
  });
});
