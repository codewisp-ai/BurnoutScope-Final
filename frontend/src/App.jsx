import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar          from "./components/Navbar";
import Landing         from "./pages/Landing";
import Dashboard       from "./pages/Dashboard";
import Timeline        from "./pages/Timeline";
import Recommendations from "./pages/Recommendations";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import { isLoggedIn }  from "./utils/auth";
import BurnoutScopeWalkthrough from "./components/BurnoutScopeWalkthrough.jsx";

// ─── Private Route wrapper ────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <BurnoutScopeWalkthrough />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-black to-slate-900 text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Routes>
            {/* Public routes */}
            <Route path="/"        element={<Landing />}   />
            <Route path="/login"   element={<Login />}     />
            <Route path="/register" element={<Register />} />

            {/* Dashboard — accessible without login, but shows auth features when logged in */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Protected routes — require login */}
            <Route path="/timeline" element={
              <PrivateRoute><Timeline /></PrivateRoute>
            } />
            <Route path="/recommendations" element={
              <PrivateRoute><Recommendations /></PrivateRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}