import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TxIcon } from "./tx-icon";

describe("TxIcon", () => {
  it("renders received icon with green styling", () => {
    render(<TxIcon type="received" />);
    const icon = screen.getByText("arrow_downward");
    expect(icon).toBeInTheDocument();
    expect(icon.closest("div")).toHaveClass("bg-green-500/20", "text-green-500");
  });

  it("renders purchase icon with primary styling", () => {
    render(<TxIcon type="purchase" />);
    const icon = screen.getByText("shopping_cart");
    expect(icon).toBeInTheDocument();
    expect(icon.closest("div")).toHaveClass("bg-primary/20", "text-primary");
  });

  it("renders failed icon with red styling", () => {
    render(<TxIcon type="failed" />);
    const icon = screen.getByText("priority_high");
    expect(icon).toBeInTheDocument();
    expect(icon.closest("div")).toHaveClass("bg-red-500/20", "text-red-500");
  });
});
