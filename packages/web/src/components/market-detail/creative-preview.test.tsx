import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CreativePreview } from "./creative-preview";
import { dimensionOptions } from "./types";
import type { MarketListing } from "./types";

const mockListing: MarketListing = {
  id: "test-id",
  title: "Test Creative",
  description: "A test creative description",
  imageUrl: "https://example.com/image.jpg",
  priceAicc: "100",
  isPremium: false,
  createdAt: new Date().toISOString(),
  creatorId: "user-1",
  creator: {
    id: "user-1",
    name: "Test Creator",
    walletAddress: "0x123",
  },
  assetType: "ad_kit",
  licenseType: "standard",
  rating: "4.5",
  reviewCount: 10,
  tags: ["test"],
  status: "active",
};

describe("CreativePreview", () => {
  it("renders the creative title", () => {
    render(
      <CreativePreview
        listing={mockListing}
        dimension={dimensionOptions[0]}
      />
    );

    expect(screen.getByText("Test Creative")).toBeInTheDocument();
  });

  it("renders the creative description for social formats", () => {
    const socialDimension = dimensionOptions.find((d) => d.category === "social")!;
    render(
      <CreativePreview
        listing={mockListing}
        dimension={socialDimension}
      />
    );

    expect(screen.getByText("A test creative description")).toBeInTheDocument();
  });

  it("renders CREATIVE badge for non-premium listings", () => {
    render(
      <CreativePreview
        listing={mockListing}
        dimension={dimensionOptions[0]}
      />
    );

    expect(screen.getByText("CREATIVE")).toBeInTheDocument();
  });

  it("renders NFT EXCLUSIVE badge for premium listings", () => {
    const premiumListing = { ...mockListing, isPremium: true };
    render(
      <CreativePreview
        listing={premiumListing}
        dimension={dimensionOptions[0]}
      />
    );

    expect(screen.getByText("NFT EXCLUSIVE")).toBeInTheDocument();
  });

  it("renders dimension label at the bottom", () => {
    const dimension = dimensionOptions[0];
    render(
      <CreativePreview
        listing={mockListing}
        dimension={dimension}
      />
    );

    expect(screen.getByText(/1080 × 1920/)).toBeInTheDocument();
    expect(screen.getByText(/9:16/)).toBeInTheDocument();
  });

  it("renders purchase button for social formats", () => {
    const socialDimension = dimensionOptions.find((d) => d.category === "social")!;
    render(
      <CreativePreview
        listing={mockListing}
        dimension={socialDimension}
      />
    );

    expect(screen.getByText("PURCHASE LICENSE")).toBeInTheDocument();
  });

  it("does not render purchase button for display ad formats", () => {
    const displayDimension = dimensionOptions.find((d) => d.category === "display")!;
    render(
      <CreativePreview
        listing={mockListing}
        dimension={displayDimension}
      />
    );

    expect(screen.queryByText("PURCHASE LICENSE")).not.toBeInTheDocument();
  });

  it("renders safe zone indicator for social formats", () => {
    const socialDimension = dimensionOptions.find((d) => d.category === "social")!;
    render(
      <CreativePreview
        listing={mockListing}
        dimension={socialDimension}
      />
    );

    expect(screen.getByText("Safe Zone")).toBeInTheDocument();
  });

  it("does not render safe zone indicator for display ad formats", () => {
    const displayDimension = dimensionOptions.find((d) => d.category === "display")!;
    render(
      <CreativePreview
        listing={mockListing}
        dimension={displayDimension}
      />
    );

    expect(screen.queryByText("Safe Zone")).not.toBeInTheDocument();
  });

  it("applies zoom scale correctly", () => {
    const { container } = render(
      <CreativePreview
        listing={mockListing}
        dimension={dimensionOptions[0]}
        zoom={50}
      />
    );

    const previewFrame = container.querySelector('[style*="transform"]');
    expect(previewFrame).toHaveStyle({ transform: "scale(0.5)" });
  });

  it("uses default zoom of 100 when not specified", () => {
    const { container } = render(
      <CreativePreview
        listing={mockListing}
        dimension={dimensionOptions[0]}
      />
    );

    const previewFrame = container.querySelector('[style*="transform"]');
    expect(previewFrame).toHaveStyle({ transform: "scale(1)" });
  });

  it("renders with grid background pattern", () => {
    const { container } = render(
      <CreativePreview
        listing={mockListing}
        dimension={dimensionOptions[0]}
      />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle({
      backgroundSize: "40px 40px",
    });
  });
});
