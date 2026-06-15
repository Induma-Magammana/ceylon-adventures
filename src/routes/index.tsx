import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin, Calendar, Users, Star, Waves, TreePine, Mountain, Anchor, Sailboat, Car } from "lucide-react";
import { heroImage, activityImages } from "@/assets/images";
import { Button } from "@/components/ui/button";
import { useAuth, signOut } from "@/lib/auth/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ceylon Booking — Activities & Experiences in Sri Lanka" },
      { name: "description", content: "Discover and book whale watching, safari, surfing, hiking, tuk tuk tours and more across Sri Lanka." },
      { property: "og:title", content: "Ceylon Booking — Activities & Experiences in Sri Lanka" },
      { property: "og:description", content: "Discover and book whale watching, safari, surfing, hiking, tuk tuk tours and more across Sri Lanka." },
      { property: "og:image", content: heroImage },
    ],
  }),
  component: Index,
});

const categories = [
  { slug: "whale-watching", name: "Whale Watching", Icon: Waves, img: activityImages.whale },
  { slug: "safari", name: "Safari Tours", Icon: TreePine, img: activityImages.safari },
  { slug: "surfing", name: "Surfing", Icon: Waves, img: activityImages.surf },
  { slug: "scuba-diving", name: "Diving", Icon: Anchor, img: activityImages.dive },
  { slug: "hiking", name: "Hiking", Icon: Mountain, img: activityImages.hike },
  { slug: "tuk-tuk-tours", name: "Tuk Tuk Tours", Icon: Car, img: activityImages.tuktuk },
  { slug: "boat-rides", name: "Boat Rides", Icon: Sailboat, img: activityImages.boat },
  { slug: "cultural", name: "Cultural", Icon: Mountain, img: activityImages.culture },
];

const featured = [
  { title: "Blue Whale Watching in Mirissa", location: "Mirissa", price: 12000, rating: 4.9, reviews: 1284, img: activityImages.whale, duration: "5h" },
  { title: "Yala Leopard Safari (Full Day)", location: "Yala National Park", price: 18500, rating: 4.8, reviews: 942, img: activityImages.safari, duration: "10h" },
  { title: "Beginner Surf Lesson — Weligama", location: "Weligama", price: 4500, rating: 4.9, reviews: 612, img: activityImages.surf, duration: "2h" },
  { title: "Hikkaduwa Reef Snorkel & Turtles", location: "Hikkaduwa", price: 3500, rating: 4.7, reviews: 488, img: activityImages.dive, duration: "3h" },
  { title: "Little Adam's Peak Sunrise Hike", location: "Ella", price: 5000, rating: 4.9, reviews: 731, img: activityImages.hike, duration: "4h" },
  { title: "Galle & Coast Tuk Tuk Day Tour", location: "Galle", price: 9000, rating: 4.8, reviews: 356, img: activityImages.tuktuk, duration: "8h" },
  { title: "Madu River Mangrove Cruise", location: "Balapitiya", price: 4200, rating: 4.7, reviews: 290, img: activityImages.boat, duration: "2h" },
  { title: "Sigiriya Rock Fortress Tour", location: "Sigiriya", price: 7500, rating: 4.9, reviews: 1102, img: activityImages.culture, duration: "6h" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-header text-header-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <a href="/" className="text-xl font-bold tracking-tight">
            Ceylon<span className="text-accent">Booking</span>
          </a>
          <HeaderNav />
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-header text-header-foreground">
        <img
          src={heroImage}
          alt="Sri Lankan coast at sunset"
          width={1920}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-28 md:pt-20 md:pb-40">
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
            Find your next Sri Lankan adventure
          </h1>
          <p className="mt-3 max-w-2xl text-base md:text-lg opacity-95">
            From blue whales in Mirissa to leopards in Yala — book authentic experiences across the island.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mx-auto -mt-14 max-w-7xl px-4 md:-mt-20">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border-2 border-accent bg-accent shadow-[var(--shadow-elevated)] md:grid-cols-[1.4fr_1fr_1fr_auto]">
            <label className="flex items-center gap-2 bg-background px-4 py-3">
              <MapPin className="size-5 text-muted-foreground" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Where to? e.g. Mirissa, Ella, Yala" />
            </label>
            <label className="flex items-center gap-2 bg-background px-4 py-3">
              <Search className="size-5 text-muted-foreground" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Activity (whale, surf, hike...)" />
            </label>
            <label className="flex items-center gap-2 bg-background px-4 py-3">
              <Calendar className="size-5 text-muted-foreground" />
              <input type="date" className="w-full bg-transparent text-sm outline-none" />
            </label>
            <label className="flex items-center gap-2 bg-background px-4 py-3 md:hidden">
              <Users className="size-5 text-muted-foreground" />
              <input type="number" min={1} defaultValue={2} className="w-full bg-transparent text-sm outline-none" />
            </label>
            <button className="bg-accent px-6 py-3 text-sm font-bold text-accent-foreground hover:bg-[var(--accent-hover)]">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-12">
        <h2 className="mb-6 text-2xl font-bold">Browse by category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((c) => (
            <a key={c.slug} href="#" className="group relative overflow-hidden rounded-md shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]">
              <img src={c.img} alt={c.name} loading="lazy" className="h-32 w-full object-cover transition group-hover:scale-105 md:h-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3 text-white">
                <c.Icon className="size-4" />
                <span className="text-sm font-semibold">{c.name}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Most popular experiences</h2>
            <p className="text-sm text-muted-foreground">Travellers rate these the highest</p>
          </div>
          <a href="#" className="hidden text-sm font-semibold text-primary hover:underline md:block">See all →</a>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((a) => (
            <article key={a.title} className="overflow-hidden rounded-md bg-card shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]">
              <div className="relative">
                <img src={a.img} alt={a.title} loading="lazy" className="h-48 w-full object-cover" />
                <span className="absolute left-2 top-2 rounded bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                  Bestseller
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {a.location} · {a.duration}
                </div>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug min-h-10">{a.title}</h3>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <span className="inline-flex items-center justify-center rounded bg-primary px-1.5 py-0.5 font-bold text-primary-foreground">
                    {a.rating}
                  </span>
                  <span className="font-semibold">Exceptional</span>
                  <span className="text-muted-foreground">· {a.reviews.toLocaleString()} reviews</span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] text-muted-foreground">From</p>
                    <p className="text-lg font-bold text-price">LKR {a.price.toLocaleString()}</p>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-[var(--primary-hover)]">View</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3">
          {[
            { t: "Verified local providers", d: "Every operator is vetted before going live." },
            { t: "Free cancellation", d: "On most activities up to 24 hours in advance." },
            { t: "24/7 support", d: "Talk to a real person in Colombo any time." },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3">
              <Star className="mt-0.5 size-5 fill-accent text-accent" />
              <div>
                <p className="font-semibold">{f.t}</p>
                <p className="text-sm text-muted-foreground">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-header py-10 text-header-foreground">
        <div className="mx-auto max-w-7xl px-4 text-sm opacity-80">
          © {new Date().getFullYear()} Ceylon Booking — Tourism activities across Sri Lanka.
        </div>
      </footer>
    </div>
  );
}

function HeaderNav() {
  const { loading, user } = useAuth();
  return (
    <nav className="hidden items-center gap-6 text-sm md:flex">
      <Link to="/auth" className="hover:underline">List your activity</Link>
      <a href="#" className="hover:underline">Help</a>
      <a href="#" className="hover:underline">LKR</a>
      {loading ? null : user ? (
        <>
          <Link to="/profile" className="hover:underline">{user.email}</Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => signOut()}
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
          >
            Sign out
          </Button>
        </>
      ) : (
        <Link to="/auth">
          <Button className="bg-white text-header hover:bg-white/90" size="sm">Sign in</Button>
        </Link>
      )}
    </nav>
  );
}
