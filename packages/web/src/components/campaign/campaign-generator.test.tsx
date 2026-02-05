import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CampaignGenerator } from "./campaign-generator";

describe("CampaignGenerator", () => {
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
      })
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

  it("uploads selected assets", async () => {
    const user = userEvent.setup();
    const api = {
      listProjects: vi.fn().mockResolvedValue({ projects: [{ id: "p1", name: "Demo" }] }),
      createProject: vi.fn(),
      createBrief: vi.fn(),
      getBrief: vi.fn(),
      uploadLogo: vi.fn().mockResolvedValue({ ok: true, files: [] }),
      uploadVisuals: vi.fn().mockResolvedValue({ ok: true, files: [] })
    };

    render(<CampaignGenerator api={api} />);

    await waitFor(() => expect(api.listProjects).toHaveBeenCalledTimes(1));

    const logoInput = screen.getByLabelText("Brand Logo");
    const visualsInput = screen.getByLabelText("Main Visuals");

    await user.upload(logoInput, new File(["logo"], "logo.png", { type: "image/png" }));
    await user.upload(
      visualsInput,
      new File(["visual"], "visual.jpg", { type: "image/jpeg" })
    );

    await waitFor(() => expect(api.uploadLogo).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(api.uploadVisuals).toHaveBeenCalledTimes(1));
  });
});
