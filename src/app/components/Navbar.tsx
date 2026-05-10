"use client";

import React, { useEffect, useState } from "react";

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
            ? "bg-black/55 border-purple-300/20 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.55),0_0_22px_-10px_rgba(168,85,247,0.55)]"
            : "bg-black/30 border-white/10 shadow-none"
        }`}
      >
        <a
          href="#hero"
          onClick={(e) => handleClick(e, "#hero")}
          className="text-white text-xl font-bold tracking-tight"
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
                  isActive ? "text-purple-200" : "text-gray-300 hover:text-white"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 -bottom-1.5 -translate-x-1/2 h-px rounded-full bg-gradient-to-r from-purple-400/0 via-purple-300 to-purple-400/0 transition-[width,opacity] duration-300 ease-out ${
                    isActive
                      ? "w-5/6 opacity-90"
                      : "w-0 opacity-0 group-hover:w-2/3 group-hover:opacity-70"
                  }`}
                />
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            onClick={(e) => handleClick(e, "#contact")}
            aria-label="Open to internships and full-time roles — go to contact"
            className="group inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/[0.06] hover:bg-emerald-400/[0.12] hover:border-emerald-300/50 transition-colors duration-300 px-2.5 py-1"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]" />
            </span>
            <span className="hidden sm:inline font-mono text-[10px] tracking-widest uppercase text-emerald-200/90 group-hover:text-emerald-100">
              Open to roles
            </span>
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white text-lg leading-none"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            ☰
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-2 bg-black/55 backdrop-blur-md border border-white/10 rounded-2xl p-3">
          {navItems.map((item) => {
            const isActive = active === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-purple-200 bg-purple-500/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <div className="mt-2 px-3 py-2 inline-flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-400/[0.06]">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-emerald-200/90">
              Open to internships &amp; full-time
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
