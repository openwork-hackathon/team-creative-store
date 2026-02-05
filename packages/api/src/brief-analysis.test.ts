import { describe, expect, it } from "vitest";
import { buildBriefJsonFromInput } from "./brief-analysis";

describe("buildBriefJsonFromInput", () => {
  it("derives audience and benefits from intent text", () => {
    const briefJson = buildBriefJsonFromInput({
      intentText:
        "Launch a summer sale for eco-friendly sneakers targeting Gen Z with a minimalist aesthetic",
      industry: "Sustainable Fashion",
      placements: ["square_1_1"],
      sensitiveWords: []
    });

    expect(briefJson.industry).toBe("Sustainable Fashion");
    expect(briefJson.audience?.interests).toEqual(["Gen Z"]);
    expect(briefJson.keyBenefits).toEqual(["eco-friendly sneakers"]);
    expect(briefJson.proposedHook).toBe(
      "Launch a summer sale for eco-friendly sneakers targeting Gen Z with a minimalist aesthetic"
    );
  });
});
