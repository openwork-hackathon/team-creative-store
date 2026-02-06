import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PriceRangeFilter } from "./price-range-filter";

describe("PriceRangeFilter", () => {
  it("renders with 'All' label when no price range is set", () => {
    render(
      <PriceRangeFilter
        priceMin=""
        priceMax=""
        onPriceMinChange={() => {}}
        onPriceMaxChange={() => {}}
      />
    );
    expect(screen.getByText("Price: All")).toBeInTheDocument();
  });

  it("displays price range when min is set", () => {
    render(
      <PriceRangeFilter
        priceMin="100"
        priceMax=""
        onPriceMinChange={() => {}}
        onPriceMaxChange={() => {}}
      />
    );
    expect(screen.getByText("Price: 100 - ∞ AICC")).toBeInTheDocument();
  });

  it("displays price range when max is set", () => {
    render(
      <PriceRangeFilter
        priceMin=""
        priceMax="500"
        onPriceMinChange={() => {}}
        onPriceMaxChange={() => {}}
      />
    );
    expect(screen.getByText("Price: 0 - 500 AICC")).toBeInTheDocument();
  });

  it("displays full price range when both min and max are set", () => {
    render(
      <PriceRangeFilter
        priceMin="100"
        priceMax="500"
        onPriceMinChange={() => {}}
        onPriceMaxChange={() => {}}
      />
    );
    expect(screen.getByText("Price: 100 - 500 AICC")).toBeInTheDocument();
  });

  it("opens dropdown when button is clicked", () => {
    render(
      <PriceRangeFilter
        priceMin=""
        priceMax=""
        onPriceMinChange={() => {}}
        onPriceMaxChange={() => {}}
      />
    );
    
    fireEvent.click(screen.getByRole("button", { name: /Price:/i }));
    
    expect(screen.getByText("Min Price (AICC)")).toBeInTheDocument();
    expect(screen.getByText("Max Price (AICC)")).toBeInTheDocument();
  });

  it("calls onPriceMinChange when min input changes", () => {
    const handleMinChange = vi.fn();
    render(
      <PriceRangeFilter
        priceMin=""
        priceMax=""
        onPriceMinChange={handleMinChange}
        onPriceMaxChange={() => {}}
      />
    );
    
    fireEvent.click(screen.getByRole("button", { name: /Price:/i }));
    
    const minInput = screen.getByPlaceholderText("0");
    fireEvent.change(minInput, { target: { value: "50" } });
    
    expect(handleMinChange).toHaveBeenCalledWith("50");
  });

  it("calls onPriceMaxChange when max input changes", () => {
    const handleMaxChange = vi.fn();
    render(
      <PriceRangeFilter
        priceMin=""
        priceMax=""
        onPriceMinChange={() => {}}
        onPriceMaxChange={handleMaxChange}
      />
    );
    
    fireEvent.click(screen.getByRole("button", { name: /Price:/i }));
    
    const maxInput = screen.getByPlaceholderText("No limit");
    fireEvent.change(maxInput, { target: { value: "1000" } });
    
    expect(handleMaxChange).toHaveBeenCalledWith("1000");
  });

  it("clears both values when Clear button is clicked", () => {
    const handleMinChange = vi.fn();
    const handleMaxChange = vi.fn();
    render(
      <PriceRangeFilter
        priceMin="100"
        priceMax="500"
        onPriceMinChange={handleMinChange}
        onPriceMaxChange={handleMaxChange}
      />
    );
    
    fireEvent.click(screen.getByRole("button", { name: /Price:/i }));
    fireEvent.click(screen.getByText("Clear"));
    
    expect(handleMinChange).toHaveBeenCalledWith("");
    expect(handleMaxChange).toHaveBeenCalledWith("");
  });

  it("closes dropdown when clicking outside", () => {
    render(
      <PriceRangeFilter
        priceMin=""
        priceMax=""
        onPriceMinChange={() => {}}
        onPriceMaxChange={() => {}}
      />
    );
    
    fireEvent.click(screen.getByRole("button", { name: /Price:/i }));
    expect(screen.getByText("Min Price (AICC)")).toBeInTheDocument();
    
    // Click on the overlay
    const overlay = document.querySelector(".fixed.inset-0");
    if (overlay) {
      fireEvent.click(overlay);
    }
    
    expect(screen.queryByText("Min Price (AICC)")).not.toBeInTheDocument();
  });

  it("displays current values in inputs", () => {
    render(
      <PriceRangeFilter
        priceMin="200"
        priceMax="800"
        onPriceMinChange={() => {}}
        onPriceMaxChange={() => {}}
      />
    );
    
    fireEvent.click(screen.getByRole("button", { name: /Price:/i }));
    
    const minInput = screen.getByPlaceholderText("0") as HTMLInputElement;
    const maxInput = screen.getByPlaceholderText("No limit") as HTMLInputElement;
    
    expect(minInput.value).toBe("200");
    expect(maxInput.value).toBe("800");
  });

  it("toggles dropdown open/closed on button clicks", () => {
    render(
      <PriceRangeFilter
        priceMin=""
        priceMax=""
        onPriceMinChange={() => {}}
        onPriceMaxChange={() => {}}
      />
    );
    
    const button = screen.getByRole("button", { name: /Price:/i });
    
    // First click opens
    fireEvent.click(button);
    expect(screen.getByText("Min Price (AICC)")).toBeInTheDocument();
    
    // Second click closes
    fireEvent.click(button);
    expect(screen.queryByText("Min Price (AICC)")).not.toBeInTheDocument();
  });
});
