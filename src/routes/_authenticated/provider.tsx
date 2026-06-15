import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/auth/auth.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/provider")({
  component: ProviderDashboard,
});

function ProviderDashboard() {
  const fetchRoles = useServerFn(getMyRoles);
  const rolesQ = useQuery({ queryKey: ["my-roles"], queryFn: () => fetchRoles() });
  const isProvider = rolesQ.data?.roles.includes("provider");

  if (rolesQ.isLoading) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isProvider) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="text-xl font-bold">Service Provider access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is registered as a Tourist. Contact support to upgrade to a Service Provider.
        </p>
        <Button asChild className="mt-4"><Link to="/">Go home</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-header text-header-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Ceylon<span className="text-accent">Booking</span> · Provider
          </Link>
          <Link to="/profile" className="text-sm hover:underline">My profile</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold">Provider dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage activities, images, availability, bookings, pricing and revenue.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Manage activities", "Create & edit your activity listings"],
            ["Upload images", "Showcase your experiences"],
            ["Manage availability", "Set dates & slots"],
            ["View bookings", "See incoming reservations"],
            ["Manage pricing", "Update rates per activity"],
            ["Revenue dashboard", "Earnings & payouts"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="font-semibold">{t}</div>
              <div className="text-xs text-muted-foreground">{d}</div>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">Coming in Phase 2</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}