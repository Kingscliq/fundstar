"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, LogOut, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { address, isConnecting, connect, disconnect } = useWallet();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

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

        {address ? (
          /* Connected state — show address + dropdown */
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 h-9 px-4 rounded-full bg-[var(--text)] text-[var(--bg)] text-[0.82rem] font-semibold hover:opacity-85 transition-all active:scale-95"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)]" />
              {truncateAddress(address)}
              <ChevronDown size={13} className={cn("transition-transform", dropdownOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-[0.68rem] text-[var(--text2)] uppercase tracking-widest mb-1">Connected</p>
                    <p className="font-mono text-[0.78rem] text-[var(--text)] truncate">{address}</p>
                  </div>
                  <button
                    onClick={() => { disconnect(); setDropdownOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-3 text-[0.82rem] text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <LogOut size={14} />
                    Disconnect
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Disconnected state — trigger Freighter */
          <button
            onClick={connect}
            disabled={isConnecting}
            className="flex items-center gap-2 h-9 px-4 rounded-full bg-[var(--text)] text-[var(--bg)] text-[0.82rem] font-semibold hover:opacity-85 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)]" />
            )}
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}
