import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/dashboard/customer")({
  component: CustomerLanding,
});

type Role = "customer" | "provider" | "admin";

function CustomerLanding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        if (!user) {
          navigate({ to: "/login" });
          return;
        }

        const { data: roleRow, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (roleError) throw roleError;

        const role = roleRow?.role as Role | undefined;
        if (!role || role !== "customer") {
          setError("Forbidden: customer access only.");
          return;
        }
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Tourist Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Search Activities · View Activity Details · Book Activities · Online Payments · Wishlist · Booking History ·
          Reviews & Ratings · Profile Management
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-700">
            {error}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border bg-card p-6 shadow-[var(--shadow-card)]">
            <p className="text-sm">Landing page placeholder for customer features.</p>
          </div>
        )}
      </div>
    </div>
  );
}

