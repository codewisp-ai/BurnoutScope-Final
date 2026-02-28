import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar          from "./components/Navbar";
import Landing         from "./pages/Landing";
import Dashboard       from "./pages/Dashboard";
import Timeline        from "./pages/Timeline";
import Recommendations from "./pages/Recommendations";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-black to-slate-900 text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Routes>
            <Route path="/"                element={<Landing />}         />
            <Route path="/dashboard"       element={<Dashboard />}       />
            <Route path="/timeline"        element={<Timeline />}        />
            <Route path="/recommendations" element={<Recommendations />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}