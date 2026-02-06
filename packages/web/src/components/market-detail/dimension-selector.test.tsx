import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DimensionSelector } from "./dimension-selector";
import { dimensionOptions } from "./types";

describe("DimensionSelector", () => {
  it("renders section title", () => {
    render(<DimensionSelector selectedIndex={0} onDimensionChange={vi.fn()} />);

    expect(screen.getByText("Dimensions")).toBeInTheDocument();
  });

  it("renders all dimension options", () => {
    render(<DimensionSelector selectedIndex={0} onDimensionChange={vi.fn()} />);

    expect(screen.getByText("1080 x 1920")).toBeInTheDocument();
    expect(screen.getByText("1080 x 1080")).toBeInTheDocument();
    expect(screen.getByText("1280 x 720")).toBeInTheDocument();
  });

  it("renders all ratio labels", () => {
    render(<DimensionSelector selectedIndex={0} onDimensionChange={vi.fn()} />);

    expect(screen.getByText("9:16")).toBeInTheDocument();
    expect(screen.getByText("1:1")).toBeInTheDocument();
    expect(screen.getByText("16:9")).toBeInTheDocument();
  });

  it("highlights selected dimension with border", () => {
    render(<DimensionSelector selectedIndex={0} onDimensionChange={vi.fn()} />);

    const selectedButton = screen.getByText("1080 x 1920").closest("button");
    expect(selectedButton).toHaveClass("bg-muted");
    expect(selectedButton).toHaveClass("border");
    expect(selectedButton).toHaveClass("border-border");
  });

  it("shows non-selected dimensions with muted styling", () => {
    render(<DimensionSelector selectedIndex={0} onDimensionChange={vi.fn()} />);

    const nonSelectedButton = screen.getByText("1080 x 1080").closest("button");
    expect(nonSelectedButton).toHaveClass("text-muted-foreground");
    expect(nonSelectedButton).not.toHaveClass("border-border");
  });

  it("applies uppercase to selected dimension text", () => {
    render(<DimensionSelector selectedIndex={1} onDimensionChange={vi.fn()} />);

    const selectedText = screen.getByText("1080 x 1080");
    expect(selectedText).toHaveClass("uppercase");
    expect(selectedText).toHaveClass("text-foreground");
  });

  it("applies primary styling to selected ratio badge", () => {
    render(<DimensionSelector selectedIndex={0} onDimensionChange={vi.fn()} />);

    const selectedRatio = screen.getByText("9:16");
    expect(selectedRatio).toHaveClass("bg-primary/20");
    expect(selectedRatio).toHaveClass("text-primary");
    expect(selectedRatio).toHaveClass("font-bold");
  });

  it("calls onDimensionChange when a dimension is clicked", () => {
    const onDimensionChange = vi.fn();
    render(<DimensionSelector selectedIndex={0} onDimensionChange={onDimensionChange} />);

    fireEvent.click(screen.getByText("1080 x 1080"));
    expect(onDimensionChange).toHaveBeenCalledWith(1);
  });

  it("calls onDimensionChange with correct index for each option", () => {
    const onDimensionChange = vi.fn();
    render(<DimensionSelector selectedIndex={0} onDimensionChange={onDimensionChange} />);

    fireEvent.click(screen.getByText("1280 x 720"));
    expect(onDimensionChange).toHaveBeenCalledWith(2);
  });

  it("renders correct number of dimension buttons", () => {
    render(<DimensionSelector selectedIndex={0} onDimensionChange={vi.fn()} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(dimensionOptions.length);
  });

  it("renders buttons with correct structure", () => {
    render(<DimensionSelector selectedIndex={0} onDimensionChange={vi.fn()} />);

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      expect(button).toHaveClass("flex");
      expect(button).toHaveClass("items-center");
      expect(button).toHaveClass("justify-between");
      expect(button).toHaveClass("rounded-lg");
    }
  });
});
