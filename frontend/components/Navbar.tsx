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
  const { address, isConnecting, walletType, connect, disconnect } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  ];

  return (
    <>
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-12 h-[60px] bg-(--nav-bg) border-b border-(--border) backdrop-blur-md transition-colors duration-300">
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" className="fill-(--text)" />
            <path d="M8 14 L14 8 L20 14 L14 20 Z" className="fill-(--bg)" opacity="0.9" />
            <circle cx="14" cy="14" r="3" className="fill-(--teal)" />
          </svg>
          <span className="font-serif text-xl tracking-tight text-(--text)">
            Fund<em className="not-italic text-(--teal)">Star</em>
          </span>
        </Link>

        <div className="hidden md:flex bg-(--surface) p-1 rounded-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative px-4 py-1.5 text-[0.82rem] font-medium transition-colors rounded-lg",
                  isActive ? "text-(--text)" : "text-(--muted-custom) hover:text-(--text)"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-(--bg) border border-(--border2) rounded-lg shadow-sm"
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
            className="w-9 h-9 rounded-full border border-(--border2) bg-(--surface) flex items-center justify-center hover:bg-(--surface2) transition-all active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {address ? (
            /* Connected state — show address + dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 h-9 px-4 rounded-full bg-(--text) text-(--bg) text-[0.82rem] font-semibold hover:opacity-85 transition-all active:scale-95"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-(--teal)" />
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
                    className="absolute right-0 mt-2 w-52 bg-(--bg) border border-(--border) rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-(--border)">
                      <p className="text-[0.68rem] text-(--text2) uppercase tracking-widest mb-1">
                        Connected ({walletType})
                      </p>
                      <p className="font-mono text-[0.78rem] text-(--text) truncate">{address}</p>
                    </div>
                    <button
                      onClick={() => { disconnect(); setDropdownOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-[0.82rem] text-(--text2) hover:text-(--text) hover:bg-(--surface) transition-colors"
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
              onClick={() => setIsModalOpen(true)}
              disabled={isConnecting}
              className="flex items-center gap-2 h-9 px-4 rounded-full bg-(--text) text-(--bg) text-[0.82rem] font-semibold hover:opacity-85 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-(--teal)" />
              )}
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-(--bg) border border-(--border) w-full max-w-[360px] rounded-3xl overflow-hidden shadow-2xl shadow-black/40"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-xl text-(--text)">Select Wallet</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-(--text2) hover:text-(--text)">✕</button>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => { connect('freighter'); setIsModalOpen(false); }}
                    className="flex items-center gap-4 w-full p-4 rounded-2xl bg-(--surface) border border-(--border2) hover:border-(--teal) transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-(--text) flex items-center justify-center group-hover:scale-105 transition-transform">
                      <div className="w-6 h-6 border-2 border-(--bg) rounded-md rotate-45 flex items-center justify-center">
                        <div className="w-2 h-2 bg-(--teal) rounded-full" />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[0.9rem] text-(--text)">Freighter</p>
                      <p className="text-[0.7rem] text-(--text2)">Browser extension</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { connect('albedo'); setIsModalOpen(false); }}
                    className="flex items-center gap-4 w-full p-4 rounded-2xl bg-(--surface) border border-(--border2) hover:border-(--teal) transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-(--teal) flex items-center justify-center group-hover:scale-105 transition-transform">
                      <div className="w-5 h-5 bg-(--text) rounded-sm rotate-12" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[0.9rem] text-(--text)">Albedo</p>
                      <p className="text-[0.7rem] text-(--text2)">Web & Extension</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
