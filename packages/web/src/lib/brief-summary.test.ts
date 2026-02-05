import { describe, expect, it } from "vitest";
import { getBriefSummary } from "./brief-summary";

describe("getBriefSummary", () => {
  it("extracts summary data from a brief", () => {
    const summary = getBriefSummary({
      intentText: "Launch a sale",
      briefJson: {
        industry: "Sustainable Fashion",
        audience: {
          ageRange: "18-25",
          interests: ["Eco-conscious", "Gen Z"]
        },
        keyBenefits: ["Carbon-neutral Production"],
        proposedHook: "Step into the future without leaving a footprint."
      }
    });

    expect(summary.industry).toBe("Sustainable Fashion");
    expect(summary.targetAudience).toBe("18-25, Eco-conscious, Gen Z");
    expect(summary.primaryUsp).toBe("Carbon-neutral Production");
    expect(summary.proposedHook).toBe(
      "Step into the future without leaving a footprint."
    );
  });
});
