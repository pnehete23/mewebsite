"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";

const navItems = [
  { href: "#hero", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<string>("#hero");
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  useEffect(() => setThemeMounted(true), []);
  const isLight = themeMounted && resolvedTheme === "light";
  const toggleTheme = () => setTheme(isLight ? "dark" : "light");

  useEffect(() => {
    const ids = navItems.map((n) => n.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(`#${visible[0].target.id}`);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
      history.replaceState(null, "", href);
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-4xl">
      <div
        className={`backdrop-blur-md border rounded-full px-5 py-2.5 flex items-center justify-between transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out ${
          scrolled
            ? "bg-white/70 dark:bg-black/55 border-blue-700/30 dark:border-purple-300/20 shadow-[var(--shadow-navbar-scrolled)]"
            : "bg-white/40 dark:bg-black/30 border-black/10 dark:border-white/10 shadow-none"
        }`}
      >
        <a
          href="#hero"
          onClick={(e) => handleClick(e, "#hero")}
          className="text-black dark:text-white text-xl font-bold tracking-tight"
        >
          Prathamesh
        </a>

        <div className="hidden md:flex items-center space-x-7">
          {navItems.map((item) => {
            const isActive = active === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={`group relative text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-black dark:text-purple-200"
                    : "text-black hover:text-black dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 -bottom-1.5 -translate-x-1/2 h-px rounded-full bg-gradient-to-r from-blue-700/0 dark:from-purple-400/0 via-blue-800 dark:via-purple-300 to-blue-700/0 dark:to-purple-400/0 transition-[width,opacity] duration-300 ease-out ${
                    isActive
                      ? "w-5/6 opacity-90"
                      : "w-0 opacity-0 group-hover:w-2/3 group-hover:opacity-70"
                  }`}
                />
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
            title={`Switch to ${isLight ? "dark" : "light"} mode`}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] hover:bg-black/[0.08] hover:border-black/30 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/30 transition-colors duration-300 text-black dark:text-purple-100"
          >
            {/* Sun (visible in light mode) */}
            <FaSun
              className={`absolute text-[13px] transition-all duration-300 ${
                isLight ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
              } dark:text-gray-300`}
            />
            {/* Moon (visible in dark mode) */}
            <FaMoon
              className={`absolute text-[12px] transition-all duration-300 ${
                isLight ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
              } dark:text-gray-300`}
            />
          </button>

          <a
            href="#contact"
            onClick={(e) => handleClick(e, "#contact")}
            aria-label="Open to internships and full-time roles — go to contact"
            className="group inline-flex items-center gap-2 rounded-full border border-emerald-600/30 dark:border-emerald-300/25 bg-emerald-500/[0.08] dark:bg-emerald-500/[0.08] hover:bg-emerald-500/[0.16] dark:hover:bg-emerald-500/[0.16] hover:border-emerald-600/55 dark:hover:border-emerald-500/55 dark:bg-emerald-400/[0.06] dark:hover:bg-emerald-400/[0.12] dark:hover:border-emerald-300/50 transition-colors duration-300 px-2.5 py-1"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/80 dark:bg-emerald-400/70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]" />
            </span>
            <span className="hidden sm:inline font-mono text-[10px] tracking-widest uppercase text-black dark:text-emerald-200/90 group-hover:text-black dark:group-hover:text-emerald-100">
              Open to roles
            </span>
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-black dark:text-white text-lg leading-none"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            ☰
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-2 bg-white/80 dark:bg-black/55 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-2xl p-3">
          {navItems.map((item) => {
            const isActive = active === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-black bg-blue-800/10 dark:bg-purple-500/10 dark:text-purple-200 dark:bg-purple-500/10"
                    : "text-black hover:text-black hover:bg-black/[0.04] dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <div className="mt-2 px-3 py-2 inline-flex items-center gap-2 rounded-lg border border-emerald-600/30 dark:border-emerald-300/25 bg-emerald-500/[0.08] dark:bg-emerald-400/[0.06]">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/80 dark:bg-emerald-400/70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            </span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-black dark:text-emerald-200/90">
              Open to internships &amp; full-time
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
