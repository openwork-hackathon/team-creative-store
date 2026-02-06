import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginCardProps = {
  mode: "sign-in" | "sign-up";
  notice?: string | null;
  onModeChange: (mode: "sign-in" | "sign-up") => void;
  onSignIn: (email: string, password: string) => void;
  onSignUp: (name: string, email: string, password: string) => void;
  onGoogleSignIn?: () => void;
};

export function LoginCard({ mode, notice, onModeChange, onSignIn, onSignUp, onGoogleSignIn }: LoginCardProps) {
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

      {onGoogleSignIn && (
        <>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={onGoogleSignIn}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
        </>
      )}

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
