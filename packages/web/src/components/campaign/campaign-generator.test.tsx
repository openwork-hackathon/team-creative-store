import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CampaignGenerator } from "./campaign-generator";

describe("CampaignGenerator", () => {
  const originalFileReader = global.FileReader;

  afterEach(() => {
    global.FileReader = originalFileReader;
  });

  it("creates a brief when generate is clicked", async () => {
    const user = userEvent.setup();
    const api = {
      listProjects: vi.fn().mockResolvedValue({ projects: [{ id: "p1", name: "Demo" }] }),
      createProject: vi.fn(),
      createBrief: vi.fn().mockResolvedValue({
        brief: { id: "b1", intentText: "Launch a sale", briefJson: {} }
      }),
      getBrief: vi.fn().mockResolvedValue({
        brief: { id: "b1", intentText: "Launch a sale", briefJson: {} }
      }),
      generateCreative: vi.fn(),
      parseBriefWithAi: vi.fn()
    };

    render(<CampaignGenerator api={api} />);

    await waitFor(() => expect(api.listProjects).toHaveBeenCalledTimes(1));

    await user.type(
      screen.getByPlaceholderText(/describe your campaign goal/i),
      "Launch a sale"
    );
    await user.click(screen.getByRole("button", { name: /generate brief/i }));

    await waitFor(() => expect(api.createBrief).toHaveBeenCalledTimes(1));
  });

  it("passes brand assets when generating creatives", async () => {
    const user = userEvent.setup();
    const base64 = "bW9jaw==";
    class MockFileReader {
      result: string | ArrayBuffer | null = null;
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      readAsDataURL(file: File) {
        this.result = `data:${file.type};base64,${base64}`;
        queueMicrotask(() => this.onload?.());
      }
    }
    global.FileReader = MockFileReader as unknown as typeof FileReader;

    const api = {
      listProjects: vi.fn().mockResolvedValue({ projects: [{ id: "p1", name: "Demo" }] }),
      createProject: vi.fn(),
      createBrief: vi.fn().mockResolvedValue({
        brief: { id: "b1", intentText: "Launch a sale", briefJson: {} }
      }),
      getBrief: vi.fn().mockResolvedValue({
        brief: { id: "b1", intentText: "Launch a sale", briefJson: {} }
      }),
      generateCreative: vi.fn().mockResolvedValue({ creative: { html: "<div>Ok</div>" } }),
      parseBriefWithAi: vi.fn()
    };

    render(<CampaignGenerator api={api} />);

    await waitFor(() => expect(api.listProjects).toHaveBeenCalledTimes(1));

    await user.type(
      screen.getByPlaceholderText(/describe your campaign goal/i),
      "Launch a sale"
    );
    await user.click(screen.getByRole("button", { name: /generate brief/i }));
    await waitFor(() => expect(api.createBrief).toHaveBeenCalledTimes(1));

    const logoInput = screen.getByLabelText("Logo");
    await user.upload(logoInput, new File(["logo"], "logo.png", { type: "image/png" }));

    const generateButtons = screen.getAllByRole("button", { name: /generate creative/i });
    await user.click(generateButtons[0]);

    await waitFor(() => expect(api.generateCreative).toHaveBeenCalledTimes(1));
    const input = api.generateCreative.mock.calls[0][0];
    expect(input.brandAssets).toEqual([
      { kind: "logo", mimeType: "image/png", dataBase64: base64, name: "logo.png" }
    ]);
  });
});
