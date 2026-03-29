"use client";

import Hero from "@/components/home/Hero";
import FeatureBand from "@/components/home/FeatureBand";
import CampaignCard from "@/components/home/CampaignCard";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { MOCK_CAMPAIGNS } from "@/lib/data";

export default function Home() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <FeatureBand />

      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif text-3xl font-normal tracking-tight">Active <i className="italic text-[var(--teal)] font-normal">campaigns</i></h2>
          <Link href="/explore" className="text-[0.82rem] text-[var(--muted-custom)] hover:text-[var(--text)] transition-colors border-b border-[var(--border2)] pb-0.5">
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_CAMPAIGNS.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              <CampaignCard {...campaign} />
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
