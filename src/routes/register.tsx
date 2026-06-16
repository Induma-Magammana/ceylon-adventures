import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

export const Route = createFileRoute('/register')({
  component: RouteComponent,
})

type Role = Database['public']['Enums']['app_role']

type RegisterForm = {
  full_name: string
  email: string
  password: string
  role: Exclude<Role, 'admin'>
}

function RouteComponent() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterForm>({
    full_name: '',
    email: '',
    password: '',
    role: 'customer',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const backgroundUrl = useMemo(
    () =>
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80",
    [],
  )

  useEffect(() => {
    // If already logged in, route to landing page.
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const userId = data.session?.user?.id
      if (!userId) return

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      const role = roleData?.role as Role | undefined
      // Only navigate if we are sure a role exists.
      if (role === 'provider') navigate({ to: '/dashboard/provider' })
      else if (role === 'customer') navigate({ to: '/dashboard/customer' })
      // Otherwise stay on register page; email-confirm flow may re-open it.

    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { full_name, email, password, role } = form

    // Use try/catch so we can handle Supabase email rate-limit errors cleanly.
    let data: Awaited<ReturnType<typeof supabase.auth.signUp>>['data']
    try {
      const signUpRes = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role,
          },
        },
      })
      data = signUpRes.data

      if (signUpRes.error) throw signUpRes.error
    } catch (err) {
      const e = err as any

      if (e?.code === 'over_email_send_rate_limit') {
        setError('Too many requests. Please wait 1 minute and try again.')
        setLoading(false)
        return
      }

      console.error('[supabase.auth.signUp] error', e)
      setError(e?.message || 'Signup failed. Check your email/password and Supabase auth settings.')
      setLoading(false)
      return
    }


    // Important: if your project uses email confirmation, Supabase may not create an active session yet.
    // Only write to RLS-protected tables when we can prove the user is authenticated.
    const { data: sessionData } = await supabase.auth.getSession()
    const sessionUserId = sessionData.session?.user?.id
    const signupUserId = data.user?.id

    // Prefer authenticated session userId; fall back to signup userId only if session exists.
    const userId = sessionUserId ?? (signupUserId && sessionData.session ? signupUserId : undefined)

    // If no authenticated session yet, tell the user to confirm + sign in.
    // Do NOT attempt DB writes; with email-confirm flows the user may not be authenticated yet.
    if (!userId) {
      // Email confirmation flow: keep the user in this same tab and send them to home.
      // Supabase may not have an active session yet, so we avoid any DB writes.
      setLoading(false)
      navigate({ to: '/' })
      return
    }


    try {
      // Create role record(s) and any role-specific rows.
      // Customer: profiles + user_roles
      // Provider: providers(pending) + user_roles


      if (role === 'customer') {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: userId,
          full_name,
          email,
        })

        if (profileError) throw profileError
      }

      if (role === 'provider') {
        const { error: providerError } = await supabase.from('providers').upsert({
          user_id: userId,
          company_name: full_name || 'New Provider',
          approval_status: 'pending',
        })

        if (providerError) throw providerError
      }

      const { error: roleError } = await supabase.from('user_roles').upsert({
        user_id: userId,
        role,
      })

      if (roleError) throw roleError

      // Route after account creation
      if (role === 'provider') navigate({ to: '/dashboard/provider' })
      else navigate({ to: '/dashboard/customer' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[register] db setup error', err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function onGoogle() {
    setError(null)
    setLoading(true)

    const redirectTo = `${window.location.origin}/register`
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
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
        <h2 className="text-3xl font-semibold text-center mb-6">Create Account</h2>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="text-sm">Full name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              type="text"
              placeholder="Your name"
              className="w-full mt-1 p-2 bg-transparent border-b border-white/40 outline-none placeholder-white/60"
              required
            />
          </div>

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
              autoComplete="new-password"
              placeholder="Password"
              className="w-full mt-1 p-2 bg-transparent border-b border-white/40 outline-none placeholder-white/60"
              required
              minLength={6}
            />
          </div>

          <div className="mb-5">
            <label className="text-sm">I am a</label>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: 'customer' }))}
                className={`flex-1 rounded-md border py-2 text-sm transition ${
                  form.role === 'customer'
                    ? 'border-white/60 bg-white/15'
                    : 'border-white/25 bg-white/5 hover:bg-white/10'
                }`}
              >
                Tourist
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: 'provider' }))}
                className={`flex-1 rounded-md border py-2 text-sm transition ${
                  form.role === 'provider'
                    ? 'border-white/60 bg-white/15'
                    : 'border-white/25 bg-white/5 hover:bg-white/10'
                }`}
              >
                Service Provider
              </button>
            </div>
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
            {loading ? 'Creating account...' : 'Create Account'}
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
          Already have an account?{' '}
          <Link to="/login" className="underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

