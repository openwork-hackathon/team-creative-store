import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders the provided label", () => {
    render(<Button>Generate</Button>);
    expect(screen.getByRole("button", { name: "Generate" })).toBeInTheDocument();
  });

  it("applies the ghost variant styles", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button", { name: "Ghost" })).toHaveClass("bg-transparent");
  });
});
