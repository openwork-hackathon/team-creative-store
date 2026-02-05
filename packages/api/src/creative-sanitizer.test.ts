import { describe, expect, it } from "vitest";
import { sanitizeCreativeHtml } from "./creative-sanitizer";

describe("sanitizeCreativeHtml", () => {
  it("removes script tags and external image urls", () => {
    const html =
      '<div><script>alert("x")</script><img src="https://cdn.example.com/x.png" /><p>Ok</p></div>';
    const sanitized = sanitizeCreativeHtml(html);
    expect(sanitized).not.toContain("<script");
    expect(sanitized).not.toContain("https://cdn.example.com");
    expect(sanitized).toContain("<p>Ok</p>");
  });

  it("preserves data urls and data-asset-id for images", () => {
    const html =
      '<div><img data-asset-id="background" src="data:image/png;base64,abc123" alt="bg" /></div>';
    const sanitized = sanitizeCreativeHtml(html);
    expect(sanitized).toContain('data-asset-id="background"');
    expect(sanitized).toContain('src="data:image/png;base64,abc123"');
  });
});
