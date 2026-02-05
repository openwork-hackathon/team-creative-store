import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CampaignBrief } from "./campaign-brief";

describe("CampaignBrief", () => {
  it("renders the brief summary data", () => {
    render(
      <CampaignBrief
        summary={{
          industry: "Sustainable Fashion",
          targetAudience: "Gen Z, Eco-conscious",
          primaryUsp: "Carbon-neutral Production",
          proposedHook: "Step into the future without leaving a footprint."
        }}
      />
    );

    expect(screen.getByText("Sustainable Fashion")).toBeInTheDocument();
    expect(screen.getByText("Gen Z, Eco-conscious")).toBeInTheDocument();
    expect(screen.getByText("Carbon-neutral Production")).toBeInTheDocument();
    expect(
      screen.getByText("Step into the future without leaving a footprint.")
    ).toBeInTheDocument();
  });
});
