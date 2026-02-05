import { describe, expect, it } from "vitest";
import { createQueryClient } from "./query-client";

describe("createQueryClient", () => {
  it("creates a query client instance", () => {
    const client = createQueryClient();
    expect(client).toBeDefined();
  });
});
