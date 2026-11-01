import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signup" } =>
    search["mode"] === "signup" ? { mode: "signup" } : {},
  head: () => ({
    meta: [
      {
        title: "Sign in — Partner Hub Agent Network",
        name: "description",
        content: "Sign in to or create your Partner Hub agent account.",
      },
      { property: "og:title", content: "Sign in — Partner Hub Agent Network" },
      { property: "og:description", content: "Sign in to or create your Partner Hub agent account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "set-password";

function AuthPage() {
  const navigate = useNavigate();
  const initialMode = Route.useSearch().mode;
  const [mode, setMode] = useState<Mode>(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Invite and recovery links land here with a hash session; offer to set a password.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=invite") || hash.includes("type=recovery")) {
      setMode("set-password");
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Welcome back.");
        navigate({ to: "/dashboard", replace: true });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (data.session) {
          toast.success("Account created.");
          navigate({ to: "/dashboard", replace: true });
        } else {
          setNotice("Check your inbox — we sent you a confirmation link to activate your account.");
        }
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Password set. You're all signed in.");
        navigate({ to: "/dashboard", replace: true });
      }
    } finally {
      setBusy(false);
    }
  }

  const copy =
    mode === "signin"
      ? "Sign in to manage your Partner Hub profile."
      : mode === "signup"
        ? "Create your agent account. An existing agent or admin can then add you to the network."
        : "Choose a password to finish setting up your account.";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-[15%] h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 left-[10%] h-[24rem] w-[24rem] rounded-full bg-accent/25 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/90 p-8 shadow-lg backdrop-blur">
        <p className="font-view-label text-primary">Partner Hub · Agent Network</p>
        <h1 className="mt-3 font-view-display text-2xl font-bold text-foreground">
          {mode === "signin" ? "Welcome back" : mode === "signup" ? "Join the network" : "Set your password"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy}</p>

        {notice && (
          <p className="mt-5 rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground">
            {notice}
          </p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode !== "set-password" && (
            <label className="block">
              <span className="text-sm font-medium text-foreground">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
              />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium text-foreground">
              {mode === "set-password" ? "New password" : mode === "signup" ? "Choose a password" : "Password"}
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "One moment…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Save password"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
          {mode === "signin" ? (
            <>
              <button onClick={() => setMode("signup")} className="text-primary hover:underline">
                Create an account
              </button>
              <button
                onClick={async () => {
                  if (!email) {
                    toast.error("Enter your email first.");
                    return;
                  }
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) toast.error(error.message);
                  else toast.success("Reset link sent — check your inbox.");
                }}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                Forgot password?
              </button>
            </>
          ) : (
            <button onClick={() => setMode("signin")} className="text-primary hover:underline">
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
