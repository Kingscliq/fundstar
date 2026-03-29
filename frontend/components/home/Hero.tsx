"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-tint)] py-20 px-6 md:px-12 text-center hero-dot-grid">
      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[rgba(0,201,167,0.3)] bg-[rgba(0,201,167,0.07)] text-[0.72rem] font-semibold tracking-wider uppercase text-[var(--teal)] mb-8"
        >
          ✦ Built on Soroban · Stellar Testnet
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl md:text-6xl tracking-tight leading-[1.1] text-[var(--text)] mb-6"
        >
          Fund what matters, <br />
          <i className="italic text-[var(--teal)] font-normal">transparently</i>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-[var(--text2)] leading-relaxed font-light max-w-md mx-auto mb-10"
        >
          Launch campaigns, contribute XLM, and watch progress update live as Soroban contract events stream in.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <Link
            href="/create"
            className="px-8 py-3.5 rounded-full bg-[var(--text)] text-[var(--bg)] font-semibold text-[0.88rem] shadow-lg shadow-black/15 hover:-translate-y-0.5 hover:shadow-xl transition-all active:scale-95"
          >
            Start a campaign →
          </Link>
          <button className="px-6 py-3.5 rounded-full border border-[var(--border2)] text-[0.88rem] font-medium text-[var(--text2)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-all active:scale-95">
            Explore campaigns
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="inline-flex divide-x divide-[var(--border)] border border-[var(--border2)] rounded-2xl overflow-hidden bg-[var(--bg)] shadow-sm"
        >
          {[
            { value: "4", label: "Active", color: "text-[var(--teal)]" },
            { value: "28,400", label: "XLM Raised" },
            { value: "47", label: "Contributors" },
            { value: "$0.0007", label: "Per Tx", color: "text-[var(--teal)]" },
          ].map((stat, i) => (
            <div key={i} className="px-8 py-4 text-center">
              <div className={cn("font-serif text-2xl leading-none", stat.color || "text-[var(--text)]")}>
                {stat.value}
              </div>
              <div className="text-[0.7rem] text-[var(--muted-custom)] mt-1 tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Utility for merging classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
