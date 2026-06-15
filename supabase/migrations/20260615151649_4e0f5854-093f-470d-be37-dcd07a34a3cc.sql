
-- =========== ENUMS ===========
CREATE TYPE public.app_role AS ENUM ('customer','provider','admin');
CREATE TYPE public.approval_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','cancelled','completed');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','refunded','failed');

-- =========== UPDATED-AT HELPER ===========
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  profile_image TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========== USER ROLES (separate table — no role on profiles) ===========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =========== AUTO-CREATE PROFILE + ROLE ON SIGNUP ===========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, profile_image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== PROVIDERS ===========
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_number TEXT,
  business_address TEXT,
  approval_status public.approval_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.providers TO authenticated;
GRANT SELECT ON public.providers TO anon;
GRANT ALL ON public.providers TO service_role;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers_select_all" ON public.providers FOR SELECT USING (true);
CREATE POLICY "providers_insert_self" ON public.providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "providers_update_own" ON public.providers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "providers_admin_all" ON public.providers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========== CATEGORIES ===========
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  category_name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =========== ACTIVITIES ===========
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  location TEXT NOT NULL,
  city TEXT,
  duration_hours NUMERIC(5,2) NOT NULL DEFAULT 1,
  price_lkr NUMERIC(10,2) NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  cancellation_policy TEXT,
  included TEXT[],
  excluded TEXT[],
  cover_image TEXT,
  status public.approval_status NOT NULL DEFAULT 'pending',
  instant_confirmation BOOLEAN NOT NULL DEFAULT true,
  free_cancellation BOOLEAN NOT NULL DEFAULT true,
  family_friendly BOOLEAN NOT NULL DEFAULT true,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX activities_category_idx ON public.activities(category_id);
CREATE INDEX activities_status_idx ON public.activities(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT SELECT ON public.activities TO anon;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_public_approved" ON public.activities FOR SELECT USING (status = 'approved' OR public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_id AND p.user_id = auth.uid()));
CREATE POLICY "activities_provider_insert" ON public.activities FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_id AND p.user_id = auth.uid()));
CREATE POLICY "activities_provider_update" ON public.activities FOR UPDATE USING (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_id AND p.user_id = auth.uid()));
CREATE POLICY "activities_admin_all" ON public.activities FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========== ACTIVITY IMAGES ===========
CREATE TABLE public.activity_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_images TO authenticated;
GRANT SELECT ON public.activity_images TO anon;
GRANT ALL ON public.activity_images TO service_role;
ALTER TABLE public.activity_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_images_select" ON public.activity_images FOR SELECT USING (true);
CREATE POLICY "activity_images_provider_write" ON public.activity_images FOR ALL USING (EXISTS (SELECT 1 FROM public.activities a JOIN public.providers p ON p.id = a.provider_id WHERE a.id = activity_id AND p.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- =========== AVAILABILITY ===========
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  available_slots INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_id, available_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability TO authenticated;
GRANT SELECT ON public.availability TO anon;
GRANT ALL ON public.availability TO service_role;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_select" ON public.availability FOR SELECT USING (true);
CREATE POLICY "availability_provider_write" ON public.availability FOR ALL USING (EXISTS (SELECT 1 FROM public.activities a JOIN public.providers p ON p.id = a.provider_id WHERE a.id = activity_id AND p.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- =========== BOOKINGS ===========
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE DEFAULT ('CEY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  participants INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC(10,2) NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  notes TEXT,
  booking_status public.booking_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX bookings_user_idx ON public.bookings(user_id);
CREATE INDEX bookings_activity_idx ON public.bookings(activity_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select_own" ON public.bookings FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.activities a JOIN public.providers p ON p.id = a.provider_id WHERE a.id = activity_id AND p.user_id = auth.uid()));
CREATE POLICY "bookings_insert_self" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_update_own" ON public.bookings FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========== PAYMENTS ===========
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_reference TEXT NOT NULL UNIQUE DEFAULT ('PAY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'mock',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()));

-- =========== REVIEWS ===========
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- =========== WISHLIST ===========
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, activity_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist_own_all" ON public.wishlist FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========== SEED CATEGORIES ===========
INSERT INTO public.categories (slug, category_name, icon, description) VALUES
  ('whale-watching','Whale Watching','waves','Spot blue whales and dolphins off the southern coast'),
  ('safari','Safari Tours','tree-pine','Leopards, elephants and wild buffalo in Sri Lanka''s national parks'),
  ('boat-rides','Boat Rides','sailboat','Lagoon and river cruises across the island'),
  ('tuk-tuk-rental','Tuk Tuk Rentals','car','Self-drive tuk tuks for the ultimate road trip'),
  ('tuk-tuk-tours','Tuk Tuk Guided Tours','map','Local guides take you off the tourist trail'),
  ('surfing','Surfing Lessons','waves','Learn to surf on world-class beach breaks'),
  ('scuba-diving','Scuba Diving','anchor','Reefs, wrecks and turtles in clear tropical water'),
  ('snorkeling','Snorkeling','fish','Shallow reefs perfect for beginners'),
  ('hiking','Hiking','mountain','Adam''s Peak, Ella Rock and cloud-forest trails'),
  ('camping','Camping','tent','Glamping under the stars in tea country'),
  ('fishing','Fishing Tours','anchor','Deep-sea and lagoon fishing experiences'),
  ('village-tours','Village Tours','home','Traditional village life, food and crafts'),
  ('cultural','Cultural Tours','landmark','Temples, ancient cities and ceremonies'),
  ('adventure','Adventure Sports','flame','White-water rafting, canyoning and zip-lining');
