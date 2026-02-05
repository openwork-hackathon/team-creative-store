import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/login-page";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  component: () => (
    <LoginPage
      onSignIn={(email, password) => authClient.signIn.email({ email, password })}
      onSignUp={(name, email, password) => authClient.signUp.email({ name, email, password })}
    />
  )
});
