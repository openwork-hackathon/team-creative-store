import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiCreativePreview } from "./ai-creative-preview";

describe("AiCreativePreview", () => {
  it("renders srcdoc and prevents scripts by sandboxing", () => {
    const html = '<div>Preview</div><script>window.__ai_exec = true</script>';
    render(<AiCreativePreview html={html} title="Preview" />);

    const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute("sandbox")).not.toContain("allow-scripts");
    expect(iframe.getAttribute("srcdoc")).toContain("Preview");
    expect((window as { __ai_exec?: boolean }).__ai_exec).toBeUndefined();
  });
});
