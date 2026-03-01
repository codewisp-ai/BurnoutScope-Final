import { NavLink, useNavigate } from "react-router-dom";
import { isLoggedIn, logout, getUser } from "../utils/auth";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [user, setUser]         = useState(getUser());
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const indicatorRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    function syncAuth() {
      setLoggedIn(isLoggedIn());
      setUser(getUser());
    }
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getUser());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    setLoggedIn(false);
    setUser(null);
    navigate("/login");
  }

  return (
    <>
      <nav
        ref={navRef}
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(4,4,6,0.92)"
            : "rgba(4,4,6,0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled
            ? "1px solid rgba(251,191,36,0.08)"
            : "1px solid rgba(255,255,255,0.04)",
          boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.25) 50%, transparent 100%)" }}
        />

        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* ── Logo ── */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 group"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,146,60,0.15))",
                border: "1px solid rgba(251,191,36,0.25)",
                boxShadow: "0 0 12px rgba(251,191,36,0.15)",
              }}
            >
              🔥
            </div>
            <span className="text-base font-black tracking-wide">
              <span
                className="transition-colors duration-300"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Burnout
              </span>
              <span
                className="transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #FBBF24, #FB923C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Scope
              </span>
            </span>
          </NavLink>

          {/* ── Center Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-lg text-[11px] font-mono tracking-[0.2em] uppercase transition-all duration-200 ${
                  isActive ? "nav-active" : "nav-idle"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: "rgba(251,191,36,0.08)",
                        border: "1px solid rgba(251,191,36,0.18)",
                      }}
                    />
                  )}
                  <span className="relative" style={{ color: isActive ? "#FBBF24" : "rgba(255,255,255,0.35)" }}>
                    Home
                  </span>
                </>
              )}
            </NavLink>

            {loggedIn && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-lg text-[11px] font-mono tracking-[0.2em] uppercase transition-all duration-200`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: "rgba(251,191,36,0.08)",
                          border: "1px solid rgba(251,191,36,0.18)",
                        }}
                      />
                    )}
                    <span className="relative" style={{ color: isActive ? "#FBBF24" : "rgba(255,255,255,0.35)" }}>
                      Dashboard
                    </span>
                  </>
                )}
              </NavLink>
            )}
          </div>

          {/* ── Auth Section ── */}
          <div className="flex items-center gap-2.5">
            {loggedIn ? (
              <>
                {/* User pill */}
                <div
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "#34D399",
                      boxShadow: "0 0 6px rgba(52,211,153,0.7)",
                    }}
                  />
                  <span
                    className="text-[11px] font-mono max-w-[130px] truncate"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {user?.email || "Logged in"}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="group relative px-3.5 py-1.5 rounded-xl text-[11px] font-mono tracking-wider uppercase overflow-hidden transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.border = "1px solid rgba(239,68,68,0.25)";
                    e.currentTarget.style.color = "#FCA5A5";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login */}
                <NavLink
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-[11px] font-mono tracking-wider uppercase transition-all duration-200"
                  style={({ isActive }) => ({
                    background: isActive ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)",
                    border: isActive ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.08)",
                    color: isActive ? "#FBBF24" : "rgba(255,255,255,0.4)",
                  })}
                >
                  Login
                </NavLink>

                {/* Register — primary CTA */}
                <NavLink
                  to="/register"
                  className="relative px-4 py-1.5 rounded-xl text-[11px] font-mono tracking-wider uppercase font-bold overflow-hidden group transition-all duration-300"
                  style={({ isActive }) => ({
                    background: isActive
                      ? "linear-gradient(135deg, #FBBF24, #FB923C)"
                      : "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,146,60,0.1))",
                    border: isActive
                      ? "1px solid rgba(251,191,36,0.6)"
                      : "1px solid rgba(251,191,36,0.25)",
                    color: isActive ? "#000" : "#FBBF24",
                    boxShadow: isActive ? "0 0 20px rgba(251,191,36,0.25)" : "none",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: "linear-gradient(135deg, #FBBF24, #FB923C)" }}
                      />
                      <span
                        className="relative z-10 transition-colors duration-300"
                        style={{ color: isActive ? "#000" : undefined }}
                      >
                        Register
                      </span>
                    </>
                  )}
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');
      `}</style>
    </>
  );
}