import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Login Card */}
      <div
        className="relative w-[380px] p-8 rounded-2xl border border-white/20 
        bg-white/10 backdrop-blur-xl shadow-2xl text-white"
      >
        <h2 className="text-3xl font-semibold text-center mb-6">Login Form</h2>

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm">Enter your email</label>
          <input
            type="email"
            placeholder="Email"
            className="w-full mt-1 p-2 bg-transparent border-b border-white/40 outline-none placeholder-white/60"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="text-sm">Enter your password</label>
          <input
            type="password"
            placeholder="Password"
            className="w-full mt-1 p-2 bg-transparent border-b border-white/40 outline-none placeholder-white/60"
          />
        </div>

        {/* Options */}
        <div className="flex justify-between items-center text-sm mb-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Remember me
          </label>

          <a href="#" className="hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Button */}
        <button className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-gray-200 transition">
          Log In
        </button>

        {/* Register */}
        <p className="text-center text-sm mt-4">
          Don&apos;t have an account?{" "}
          <a href="#" className="underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
