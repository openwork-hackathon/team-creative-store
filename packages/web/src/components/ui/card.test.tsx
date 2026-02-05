import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

describe("Card", () => {
  it("renders header and content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Brief</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );

    expect(screen.getByText("Brief")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
