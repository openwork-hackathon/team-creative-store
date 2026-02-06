import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginPage } from "@/pages/login-page";
import { authClient } from "@/lib/auth-client";

function LoginRoute() {
  const navigate = useNavigate();

  const handleSignIn = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result?.data?.user) {
      navigate({ to: "/creative-studio" });
    }
    return result;
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    return authClient.signUp.email({ name, email, password });
  };

  const handleGoogleSignIn = async () => {
    return authClient.signIn.social({ provider: "google" });
  };

  return (
    <LoginPage
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onGoogleSignIn={handleGoogleSignIn}
    />
  );
}

export const Route = createFileRoute("/login")({
  component: LoginRoute
});
