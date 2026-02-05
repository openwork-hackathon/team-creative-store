import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TopNav } from "./top-nav";

describe("TopNav", () => {
  it("renders tabs and search input", () => {
    render(<TopNav />);
    expect(screen.getByText("Campaigns")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search prompts...")).toBeInTheDocument();
  });

  it("shows the user email when provided", () => {
    render(<TopNav user={{ email: "test@example.com" }} />);
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
