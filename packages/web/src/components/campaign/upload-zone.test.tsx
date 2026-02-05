import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UploadZone } from "./upload-zone";

describe("UploadZone", () => {
  it("renders title and helper text", () => {
    render(
      <UploadZone
        title="Brand Logo"
        helper="PNG, SVG up to 5MB"
        onSelect={() => undefined}
      />
    );

    expect(screen.getByText("Brand Logo")).toBeInTheDocument();
    expect(screen.getByText("PNG, SVG up to 5MB")).toBeInTheDocument();
  });

  it("supports multiple uploads when enabled", () => {
    const { container } = render(
      <UploadZone title="Visuals" helper="Images" multiple onSelect={() => undefined} />
    );
    const input = container.querySelector("input[type='file']");
    expect(input?.hasAttribute("multiple")).toBe(true);
  });
});
