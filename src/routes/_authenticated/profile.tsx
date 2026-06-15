import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/auth/auth.functions";
import { useAuth, signOut } from "@/lib/auth/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchRoles = useServerFn(getMyRoles);
  const rolesQ = useQuery({ queryKey: ["my-roles"], queryFn: () => fetchRoles() });
  const roles = rolesQ.data?.roles ?? [];

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-header text-header-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Ceylon<span className="text-accent">Booking</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="rounded-lg bg-card p-6 shadow-[var(--shadow-card)]">
          <h1 className="text-2xl font-bold">My profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {roles.map((r: string) => (
              <span key={r} className="rounded bg-primary/10 px-2 py-1 text-xs font-bold uppercase text-primary">
                {r}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/" className="rounded-lg bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)]">
            <div className="font-semibold">Browse activities</div>
            <div className="text-xs text-muted-foreground">Find experiences across Sri Lanka</div>
          </Link>
          {roles.includes("provider") && (
            <Link to="/provider" className="rounded-lg bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)]">
              <div className="font-semibold">Provider dashboard →</div>
              <div className="text-xs text-muted-foreground">Manage your listings & bookings</div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}