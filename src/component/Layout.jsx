import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Optional: tutup drawer saat pindah route
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Optional: cegah scroll body saat drawer mobile terbuka
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Shift konten saat desktop (sidebar lebar 16rem) */}
      <div className="md:ml-64">
        <Header
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
