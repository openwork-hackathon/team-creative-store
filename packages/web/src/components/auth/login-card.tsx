import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginCardProps = {
  mode: "sign-in" | "sign-up";
  notice?: string | null;
  onModeChange: (mode: "sign-in" | "sign-up") => void;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (name: string, email: string, password: string) => void;
};

export function LoginCard({ mode, notice, onModeChange, onSignIn, onSignUp }: LoginCardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "sign-in") {
      onSignIn(email, password);
      return;
    }
    onSignUp(name, email, password);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 text-center shadow-xl">
      <p className="text-xl font-semibold text-foreground">Welcome to Creative AI</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "sign-in"
          ? "Sign in to start crafting your next campaign."
          : "Create an account to start crafting your next campaign."}
      </p>
      {notice ? (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
          {notice}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
        {mode === "sign-up" ? (
          <div>
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
          </div>
        ) : null}
        <div>
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>
        <Button className="w-full" type="submit">
          {mode === "sign-in" ? "Sign In" : "Sign Up"}
        </Button>
      </form>

      <button
        type="button"
        className="mt-4 text-xs font-semibold text-primary"
        onClick={() => onModeChange(mode === "sign-in" ? "sign-up" : "sign-in")}
      >
        {mode === "sign-in" ? "Create account" : "Back to sign in"}
      </button>
    </div>
  );
}
