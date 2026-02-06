import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("renders confirmed status with green styling", () => {
    render(<StatusBadge status="confirmed" />);
    const badge = screen.getByText("Confirmed");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-green-500/10", "text-green-500");
  });

  it("renders pending status with yellow styling", () => {
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText("Pending");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-yellow-500/10", "text-yellow-500");
  });

  it("renders reverted status with red styling", () => {
    render(<StatusBadge status="reverted" />);
    const badge = screen.getByText("Reverted");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-red-500/10", "text-red-500");
  });
});
