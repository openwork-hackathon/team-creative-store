import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IntentInput } from "./intent-input";

describe("IntentInput", () => {
  it("calls onGenerate when the button is clicked", async () => {
    const user = userEvent.setup();
    const handleGenerate = vi.fn();

    render(
      <IntentInput
        value="Launch a sale"
        onChange={() => undefined}
        onGenerate={handleGenerate}
      />
    );

    await user.click(screen.getByRole("button", { name: /generate brief/i }));
    expect(handleGenerate).toHaveBeenCalledTimes(1);
  });
});
