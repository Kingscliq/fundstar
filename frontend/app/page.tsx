"use client";

import Hero from "@/components/home/Hero";
import FeatureBand from "@/components/home/FeatureBand";
import CampaignCard from "@/components/home/CampaignCard";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const MOCK_CAMPAIGNS = [
  {
    id: "1",
    category: "Education" as const,
    name: "Build a coding lab for rural schools",
    description: "Programming education for 500+ students across 3 underserved regions.",
    raised: 7200,
    goal: 10000,
    daysLeft: 8,
    backers: 18,
    artType: "pills" as const,
  },
  {
    id: "2",
    category: "Art" as const,
    name: "Decentralized music album funding",
    description: "Helping an independent artist record their debut album on-chain.",
    raised: 2800,
    goal: 10000,
    daysLeft: 21,
    backers: 6,
    artType: "circles" as const,
  },
  {
    id: "3",
    category: "Tech" as const,
    name: "Open source Stellar dev tools",
    description: "A free SDK toolkit for Soroban smart contract developers worldwide.",
    raised: 4750,
    goal: 5000,
    daysLeft: 12,
    backers: 11,
    artType: "semis" as const,
  },
  {
    id: "4",
    category: "Environment" as const,
    name: "Ocean plastic cleanup initiative",
    description: "Funding equipment for coastal cleanup crews in West Africa.",
    raised: 8200,
    goal: 20000,
    daysLeft: 2,
    backers: 12,
    artType: "health" as const,
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <FeatureBand />

      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif text-3xl font-normal tracking-tight">Active <i className="italic text-[var(--teal)] font-normal">campaigns</i></h2>
          <button className="text-[0.82rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors border-b border-[var(--border2)] pb-0.5">
            See all →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_CAMPAIGNS.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <CampaignCard {...campaign} />
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
