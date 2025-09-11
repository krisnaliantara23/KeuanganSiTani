// src/component/Layout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import motion
import Sidebar from "./Sidebar";
import Header from "./Header";

// Konfigurasi animasi
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

export default function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header onLogout={handleLogout} />

        {/* Page Content with Animation */}
        <motion.main
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
