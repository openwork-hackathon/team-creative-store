import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginPage } from "./login-page";

describe("LoginPage", () => {
  it("renders the login card", () => {
    render(<LoginPage onSignIn={vi.fn()} onSignUp={vi.fn()} />);
    expect(screen.getByText("Welcome to Creative AI")).toBeInTheDocument();
  });

  it("shows success notice and returns to sign-in after sign-up", async () => {
    const user = userEvent.setup();
    const handleSignUp = vi.fn().mockResolvedValue(undefined);

    render(<LoginPage onSignIn={vi.fn()} onSignUp={handleSignUp} />);

    await user.click(screen.getByRole("button", { name: /create account/i }));
    await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(
        screen.getByText("Account created. Please sign in.")
      ).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
