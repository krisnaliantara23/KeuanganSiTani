import React from "react";
import { Menu } from "lucide-react"; // dari lucide-react

const Header = ({ onMenuClick }) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
      <button 
        onClick={onMenuClick} 
        className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="text-lg font-bold">SiTani</h1>
    </header>
  );
};

export default Header;
