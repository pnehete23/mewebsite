"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "projects" },
  { href: "/contact", label: "Contact" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-4xl">
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between">
        <div className="text-white text-xl font-bold">
          Prathamesh
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === item.href 
                  ? 'text-blue-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white"
        >
          ☰
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`block py-2 text-sm font-medium transition-colors duration-200 ${
                pathname === item.href 
                  ? 'text-blue-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
