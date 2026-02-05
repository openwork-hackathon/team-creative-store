import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginCard } from "./login-card";

describe("LoginCard", () => {
  it("submits email sign-in", async () => {
    const user = userEvent.setup();
    const handleSignIn = vi.fn();

    render(
      <LoginCard
        mode="sign-in"
        onModeChange={vi.fn()}
        onSignIn={handleSignIn}
        onSignUp={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(handleSignIn).toHaveBeenCalledWith("user@example.com", "password123");
  });

  it("submits email sign-up", async () => {
    const user = userEvent.setup();
    const handleSignUp = vi.fn();

    render(
      <LoginCard
        mode="sign-up"
        onModeChange={vi.fn()}
        onSignIn={vi.fn()}
        onSignUp={handleSignUp}
      />
    );
    await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(handleSignUp).toHaveBeenCalledWith(
      "Ada Lovelace",
      "ada@example.com",
      "password123"
    );
  });

  it("requests a mode change when toggled", async () => {
    const user = userEvent.setup();
    const handleModeChange = vi.fn();

    render(
      <LoginCard
        mode="sign-in"
        onModeChange={handleModeChange}
        onSignIn={vi.fn()}
        onSignUp={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(handleModeChange).toHaveBeenCalledWith("sign-up");
  });
});
