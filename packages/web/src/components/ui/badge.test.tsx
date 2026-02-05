import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders the badge label", () => {
    render(<Badge>AI Analyzed</Badge>);
    expect(screen.getByText("AI Analyzed")).toBeInTheDocument();
  });
});
