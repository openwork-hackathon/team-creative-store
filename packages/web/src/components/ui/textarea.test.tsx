import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders with the provided placeholder", () => {
    render(<Textarea placeholder="Describe your campaign goal" />);
    expect(screen.getByPlaceholderText("Describe your campaign goal")).toBeInTheDocument();
  });
});
