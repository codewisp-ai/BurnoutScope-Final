import { NavLink, useNavigate } from "react-router-dom";
import { isLoggedIn, logout, getUser } from "../utils/auth";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [user, setUser]         = useState(getUser());

  // Re-check on storage changes (login/logout from other tabs)
  useEffect(() => {
    function syncAuth() {
      setLoggedIn(isLoggedIn());
      setUser(getUser());
    }
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // Also sync when the component re-renders after navigation
  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getUser());
  } , []);

  function handleLogout() {
    logout();
    setLoggedIn(false);
    setUser(null);
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#080a0e]/80 backdrop-blur-md border-b border-white/8">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <NavLink to="/" className="text-xl font-black tracking-wide font-['Syne',sans-serif]">
          <span className="text-white">Burnout</span>
          <span className="text-amber-400">Scope</span>
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-5 text-sm font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-amber-400 font-mono text-xs tracking-widest uppercase"
                : "text-white/40 hover:text-white/70 transition-colors font-mono text-xs tracking-widest uppercase"
            }
          >
            Home
          </NavLink>

          {loggedIn && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-amber-400 font-mono text-xs tracking-widest uppercase"
                  : "text-white/40 hover:text-white/70 transition-colors font-mono text-xs tracking-widest uppercase"
              }
            >
              Dashboard
            </NavLink>
          )}

          {/* Auth section */}
          {loggedIn ? (
            <div className="flex items-center gap-3 ml-2">
              {/* User email badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-white/40 max-w-[140px] truncate">
                  {user?.email || "Logged in"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/50
                  hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? "bg-amber-400/20 border-amber-400/40 text-amber-300"
                      : "bg-white/4 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? "bg-amber-400 border-amber-400 text-black"
                      : "bg-amber-400/15 border-amber-400/30 text-amber-400 hover:bg-amber-400/25 hover:border-amber-400/50"
                  }`
                }
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}