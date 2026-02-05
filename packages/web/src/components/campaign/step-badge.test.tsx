import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StepBadge } from "./step-badge";

describe("StepBadge", () => {
  it("renders the step number", () => {
    render(<StepBadge step={2} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
