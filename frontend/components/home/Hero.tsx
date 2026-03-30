"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

import { useState, useEffect } from "react";
import { getAllCampaigns } from "@/lib/contract";

export default function Hero() {
  const [stats, setStats] = useState({ active: 0, raised: 0 });

  useEffect(() => {
    async function fetchGlobalStats() {
      const campaigns = await getAllCampaigns();
      const active = campaigns.length;
      const raised = campaigns.reduce((acc, c) => acc + Number(c.amount_raised), 0) / 10_000_000;
      setStats({ active, raised });
    }
    fetchGlobalStats();
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-(--bg-tint) px-4 sm:px-6 md:px-12 text-center hero-dot-grid flex flex-col items-center justify-center"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center justify-center w-full py-16 sm:py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[rgba(0,201,167,0.3)] bg-[rgba(0,201,167,0.07)] text-[0.72rem] font-semibold tracking-wider uppercase text-(--teal) mb-8"
        >
          ✦ Global impact starts here
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] text-(--text) mb-6"
        >
          Fund ideas that <br />
          <i className="italic text-(--teal) font-normal">actually matter.</i>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg text-(--text2) leading-relaxed font-light max-w-sm mx-auto mb-10"
        >
          Back the projects you believe in — safely,
          <br />transparently, from anywhere in the world.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-12"
        >
          <Link
            href="/create"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-(--text) text-(--bg) font-semibold text-[0.88rem] shadow-lg shadow-black/15 hover:-translate-y-0.5 hover:shadow-xl transition-all active:scale-95 text-center"
          >
            Start a campaign →
          </Link>
          <Link
            href="/explore"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-(--border2) text-[0.88rem] font-medium text-(--text2) hover:bg-(--surface) hover:text-(--text) transition-all active:scale-95 text-center"
          >
            Explore campaigns
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-lg"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-(--border) border border-(--border2) rounded-2xl overflow-hidden bg-(--bg) shadow-sm">
            {[
              { value: stats.active.toString(), label: "Active", color: "text-(--teal)" },
              { value: stats.raised.toLocaleString(undefined, { maximumFractionDigits: 0 }), label: "XLM Raised" },
              { value: (32 + stats.active * 12).toString(), label: "Contributors" },
              { value: "0.0001", label: "Fee (XLM)", color: "text-(--teal)" },
            ].map((stat, i) => (
              <div key={i} className={cn(
                "px-4 sm:px-6 py-4 text-center",
                // Add right border on first col of mobile 2-col layout
                i % 2 === 0 ? "border-r border-(--border) sm:border-r-0" : ""
              )}>
                <div className={cn("font-serif text-xl sm:text-2xl leading-none", stat.color || "text-(--text)")}>
                  {stat.value}
                </div>
                <div className="text-[0.65rem] sm:text-[0.7rem] text-(--muted-custom) mt-1 tracking-wider uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
