import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("renders with the provided placeholder", () => {
    render(<Input placeholder="Search prompts..." />);
    expect(screen.getByPlaceholderText("Search prompts...")).toBeInTheDocument();
  });
});
