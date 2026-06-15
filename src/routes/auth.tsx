import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { becomeProvider } from "@/lib/auth/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLE_KEY = "ceylon_signup_role";
const PROVIDER_KEY = "ceylon_pending_provider";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or Sign up — Ceylon Booking" },
      { name: "description", content: "Sign in or create a Ceylon Booking account as a Tourist or Service Provider." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";
type Role = "tourist" | "provider";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<Role>("tourist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already signed in, redirect home (or finish pending provider promotion)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      const pending = typeof window !== "undefined" ? sessionStorage.getItem(PROVIDER_KEY) : null;
      if (pending) {
        try {
          const parsed = JSON.parse(pending) as { companyName: string; contactNumber?: string };
          await becomeProvider({ data: { companyName: parsed.companyName || "My Business", contactNumber: parsed.contactNumber } });
        } catch (e) {
          console.error(e);
        } finally {
          sessionStorage.removeItem(PROVIDER_KEY);
          sessionStorage.removeItem(ROLE_KEY);
        }
        if (!cancelled) navigate({ to: "/provider" });
        return;
      }
      if (!cancelled) navigate({ to: "/" });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        if (role === "provider" && companyName.trim().length < 2) {
          throw new Error("Company name is required for Service Providers");
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: fullName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (role === "provider") {
          // Either session exists now (auto-confirm) or after email confirm — store intent
          sessionStorage.setItem(
            PROVIDER_KEY,
            JSON.stringify({ companyName, contactNumber }),
          );
          if (data.session) {
            await becomeProvider({ data: { companyName, contactNumber } });
            sessionStorage.removeItem(PROVIDER_KEY);
            navigate({ to: "/provider" });
            return;
          }
        }
        if (!data.session) {
          setError("Check your inbox to confirm your email, then sign in.");
          setMode("signin");
          return;
        }
        navigate({ to: role === "provider" ? "/provider" : "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup" && role === "provider") {
        if (companyName.trim().length < 2) {
          throw new Error("Enter a company name before continuing with Google");
        }
        sessionStorage.setItem(
          PROVIDER_KEY,
          JSON.stringify({ companyName, contactNumber }),
        );
      }
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth`,
      });
      if (result.error) throw new Error(String(result.error));
      if (result.redirected) return;
      // Tokens already set — useEffect above will finish the flow on next render
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-header text-header-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Ceylon<span className="text-accent">Booking</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-12">
        <div className="overflow-hidden rounded-lg bg-card shadow-[var(--shadow-elevated)]">
          <div className="grid grid-cols-2 text-sm font-semibold">
            <button
              onClick={() => setMode("signin")}
              className={`py-3 ${mode === "signin" ? "bg-card text-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`py-3 ${mode === "signup" ? "bg-card text-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4 p-6">
            {mode === "signup" && (
              <>
                <div>
                  <Label>I am a…</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["tourist", "provider"] as Role[]).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`rounded-md border-2 px-3 py-3 text-left text-sm transition ${
                          role === r
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        <div className="font-bold">{r === "tourist" ? "🧳 Tourist" : "🏝️ Service Provider"}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {r === "tourist" ? "Book activities & experiences" : "List & manage activities"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>

                {role === "provider" && (
                  <>
                    <div>
                      <Label htmlFor="company">Company / Business name</Label>
                      <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="contact">Contact number</Label>
                      <Input id="contact" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="+94 ..." />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === "signin" ? "current-password" : "new-password"} />
            </div>

            {error && <p className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={busy} className="w-full bg-primary hover:bg-[var(--primary-hover)]">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <div className="relative py-2 text-center text-xs text-muted-foreground">
              <span className="bg-card px-2">or</span>
              <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
            </div>

            <Button type="button" variant="outline" disabled={busy} onClick={handleGoogle} className="w-full">
              Continue with Google
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By continuing you agree to Ceylon Booking's Terms & Privacy Policy.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}