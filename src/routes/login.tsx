import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Role = Database["public"]["Enums"]["app_role"];

type LoginForm = {
  email: string;
  password: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundUrl = useMemo(
    () =>
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80",
    [],
  );

  useEffect(() => {
    // If already logged in, immediately route to landing page.
    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const role = roleData?.role as Role | undefined;
      if (role === "provider") navigate({ to: "/dashboard/provider" });
      else if (role === "customer") navigate({ to: "/dashboard/customer" });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function routeByRole(userId: string) {
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleError) throw roleError;

    const role = roleData?.role as Role | undefined;
    if (role === "provider") return navigate({ to: "/dashboard/provider" });
    if (role === "customer") return navigate({ to: "/dashboard/customer" });

    setError("No role found for this account. Please contact support.");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { email, password } = form;

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Common when Supabase email confirmation is enabled.
      const msg = signInError.message ?? "";
      const lower = msg.toLowerCase();

      if (
        lower.includes("email") &&
        (lower.includes("confirm") || lower.includes("not confirmed"))
      ) {
        setError("Email not confirmed. Please verify your email, then try logging in again.");
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      setError(sessionError.message);
      setLoading(false);
      return;
    }

    const userId = sessionData.session?.user?.id ?? data.user?.id;
    if (userId) {
      try {
        await routeByRole(userId);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Login succeeded but no user id was returned.");
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setLoading(true);

    const redirectTo = `${window.location.origin}/login`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url('${backgroundUrl}')` }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative w-[380px] p-8 rounded-2xl border border-white/20 
        bg-white/10 backdrop-blur-xl shadow-2xl text-white"
      >
        <h2 className="text-3xl font-semibold text-center mb-6">Login Form</h2>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="text-sm">Enter your email</label>
            <input
              name="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              type="email"
              autoComplete="email"
              placeholder="Email"
              className="w-full mt-1 p-2 bg-transparent border-b border-white/40 outline-none placeholder-white/60"
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-sm">Enter your password</label>
            <input
              name="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              className="w-full mt-1 p-2 bg-transparent border-b border-white/40 outline-none placeholder-white/60"
              required
            />
          </div>

          <div className="flex justify-between items-center text-sm mb-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#" className="hover:underline">
              Forgot password?
            </a>
          </div>

          {error ? (
            <div className="mb-4 rounded-md bg-red-500/20 border border-red-500/30 p-3 text-xs">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-gray-200 transition disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <button
          type="button"
          onClick={onGoogle}
          disabled={loading}
          className="w-full mt-4 inline-flex items-center justify-center gap-2 border border-white/30 bg-white/10 py-2 rounded-md text-sm font-medium hover:bg-white/15 transition disabled:opacity-70"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm mt-4">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

