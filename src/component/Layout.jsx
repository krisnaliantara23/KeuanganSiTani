// Layout.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cek ukuran layar saat load
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true); // default terbuka di desktop
    } else {
      setSidebarOpen(false); // default tertutup di mobile
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main
        className={`flex-1 p-6 bg-gray-50 transition-all duration-300
          ${sidebarOpen ? "ml-64" : "ml-0"}`}
      >
        {children}

        {/* Footer */}
        <footer className="mt-6">
          <Footer />
        </footer>
      </main>
    </div>
  );
}
