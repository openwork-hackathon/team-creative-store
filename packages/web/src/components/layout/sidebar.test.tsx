import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  it("renders primary navigation items", () => {
    render(<Sidebar />);
    expect(screen.getByText("Creative Studio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Project" })).toBeInTheDocument();
  });
});
