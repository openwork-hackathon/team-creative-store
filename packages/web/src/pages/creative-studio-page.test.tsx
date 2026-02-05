import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CreativeStudioPage } from "./creative-studio-page";

describe("CreativeStudioPage", () => {
  it("renders the campaign generator heading", () => {
    render(<CreativeStudioPage />);
    expect(screen.getByText("AI Campaign Generator")).toBeInTheDocument();
  });
});
