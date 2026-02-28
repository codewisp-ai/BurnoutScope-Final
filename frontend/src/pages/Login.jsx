import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { setToken, setUser } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await loginUser(form);
      setToken(token);
      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#080a0e] flex items-center justify-center px-4 font-['Syne',sans-serif]">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-red-600/4 rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/8
            text-amber-400 text-xs font-mono tracking-[0.2em] uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Welcome Back
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Sign in to your account</h1>
          <p className="text-white/35 text-sm mt-2">Your burnout insights are waiting.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent rounded-t-2xl" />

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-mono tracking-widest text-white/40 uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white
                  placeholder-white/20 focus:outline-none focus:border-amber-400/50 focus:bg-black/60
                  transition-all duration-200 font-mono"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono tracking-widest text-white/40 uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white
                  placeholder-white/20 focus:outline-none focus:border-amber-400/50 focus:bg-black/60
                  transition-all duration-200 font-mono"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-xs text-red-300 font-mono">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="w-full py-4 rounded-xl bg-amber-400 text-black font-bold text-sm tracking-widest uppercase
                font-mono disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-300
                active:scale-[0.99] transition-all duration-200 shadow-[0_0_30px_rgba(251,191,36,0.2)]
                hover:shadow-[0_0_40px_rgba(251,191,36,0.35)]"
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-xs font-mono text-white/20">or</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* Register link */}
          <p className="text-center text-xs text-white/30 font-mono">
            Don't have an account?{" "}
            <Link to="/register" className="text-amber-400/80 hover:text-amber-400 transition-colors underline underline-offset-2">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
      `}</style>
    </div>
  );
}