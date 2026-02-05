import { useState } from "react";
import { LoginCard } from "@/components/auth/login-card";

type LoginPageProps = {
  onSignIn: (email: string, password: string) => Promise<unknown> | void;
  onSignUp: (name: string, email: string, password: string) => Promise<unknown> | void;
};

export function LoginPage({ onSignIn, onSignUp }: LoginPageProps) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [notice, setNotice] = useState<string | null>(null);

  const handleSignIn = async (email: string, password: string) => {
    setNotice(null);
    await onSignIn(email, password);
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    setNotice(null);
    await onSignUp(name, email, password);
    setNotice("Account created. Please sign in.");
    setMode("sign-in");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoginCard
        mode={mode}
        notice={notice}
        onModeChange={setMode}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
      />
    </div>
  );
}
