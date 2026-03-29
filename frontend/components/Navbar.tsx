"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Moon, Sun, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const navLinks = [
    { name: "Explore", href: "/" },
    { name: "Create", href: "/create" },
    { name: "Docs", href: "/docs" },
  ];

  return (
    <nav className="sticky top-0 z-[200] flex items-center justify-between px-6 md:px-12 h-[60px] bg-[var(--nav-bg)] border-b border-[var(--border)] backdrop-blur-md transition-colors duration-300">
      <Link href="/" className="flex items-center gap-2.5 group">
        <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" className="fill-[var(--text)]" />
          <path d="M8 14 L14 8 L20 14 L14 20 Z" className="fill-[var(--bg)]" opacity="0.9" />
          <circle cx="14" cy="14" r="3" className="fill-[var(--teal)]" />
        </svg>
        <span className="font-serif text-xl tracking-tight text-[var(--text)]">
          Fund<em className="not-italic text-[var(--teal)]">Star</em>
        </span>
      </Link>

      <div className="flex bg-[var(--surface)] p-1 rounded-xl hidden md:flex">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "relative px-4 py-1.5 text-[0.82rem] font-medium transition-colors rounded-lg",
                isActive ? "text-[var(--text)]" : "text-[var(--muted-custom)] hover:text-[var(--text)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-[var(--bg)] border border-[var(--border2)] rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{link.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full border border-[var(--border2)] bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--surface2)] transition-all active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button className="flex items-center gap-2 h-9 px-4 rounded-full bg-[var(--text)] text-[var(--bg)] text-[0.82rem] font-semibold hover:opacity-85 transition-all active:scale-95">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)]" />
          Connect Wallet
        </button>
      </div>
    </nav>
  );
}
