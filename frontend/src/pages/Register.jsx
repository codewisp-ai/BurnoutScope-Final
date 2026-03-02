import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { setToken, setUser } from "../utils/auth";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", githubUsername: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) return;
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await registerUser({
        email: form.email,
        password: form.password,
        githubUsername: form.githubUsername,
      });
      setToken(token);
      setUser(user);
      window.dispatchEvent(new Event("storage"));
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#080a0e] flex items-center justify-center px-4 font-['Syne',sans-serif] py-10">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-emerald-500/4 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-500/4 rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/8
            text-emerald-400 text-xs font-mono tracking-[0.2em] uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free Account
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create your account</h1>
          <p className="text-white/35 text-sm mt-2">Start detecting burnout in under 60 seconds.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent rounded-t-2xl" />

          <form onSubmit={handleSubmit} className="space-y-4">

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

            {/* GitHub Username */}
            <div>
              <label className="block text-xs font-mono tracking-widest text-white/40 uppercase mb-2">
                GitHub Username{" "}
                <span className="text-white/20 normal-case font-sans tracking-normal">(optional — can add later)</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="githubUsername"
                  value={form.githubUsername}
                  onChange={handleChange}
                  placeholder="e.g. torvalds"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white
                    placeholder-white/20 focus:outline-none focus:border-amber-400/50 focus:bg-black/60
                    transition-all duration-200 font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono tracking-widest text-white/40 uppercase mb-2">
                Password <span className="text-white/20 normal-case font-sans tracking-normal">(min. 6 chars)</span>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-mono tracking-widest text-white/40 uppercase mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 text-sm text-white
                  placeholder-white/20 focus:outline-none focus:bg-black/60 transition-all duration-200 font-mono ${
                    form.confirmPassword && form.confirmPassword !== form.password
                      ? "border-red-500/40 focus:border-red-500/60"
                      : "border-white/10 focus:border-amber-400/50"
                  }`}
              />
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-[10px] text-red-400/80 font-mono mt-1 ml-1">Passwords don't match</p>
              )}
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
              disabled={loading || !form.email || !form.password || !form.confirmPassword}
              className="w-full py-4 rounded-xl bg-amber-400 text-black font-bold text-sm tracking-widest uppercase
                font-mono disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-300
                active:scale-[0.99] transition-all duration-200 shadow-[0_0_30px_rgba(251,191,36,0.2)]
                hover:shadow-[0_0_40px_rgba(251,191,36,0.35)] mt-2"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-xs font-mono text-white/20">or</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* Login link */}
          <p className="text-center text-xs text-white/30 font-mono">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-400/80 hover:text-amber-400 transition-colors underline underline-offset-2">
              Sign in
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