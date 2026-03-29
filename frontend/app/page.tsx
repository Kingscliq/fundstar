"use client";

import Hero from "@/components/home/Hero";
import FeatureBand from "@/components/home/FeatureBand";
import CampaignCard from "@/components/home/CampaignCard";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllCampaigns } from "@/lib/contract";
import { Campaign } from "@/lib/types";

const CATEGORIES: ("Education" | "Art" | "Tech" | "Environment")[] = ["Education", "Art", "Tech", "Environment"];
const ART_TYPES: ("pills" | "circles" | "semis" | "health")[] = ["pills", "circles", "semis", "health"];

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const data = await getAllCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error("Failed to load campaigns:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCampaigns();
  }, []);

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
          {loading ? (
            // Skeleton Loader
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-[400px] rounded-3xl bg-[var(--surface)] animate-pulse border border-[var(--border)]" />
            ))
          ) : campaigns.length > 0 ? (
            campaigns.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full"
              >
                <CampaignCard 
                  id={campaign.id}
                  name={campaign.name}
                  description={campaign.description}
                  raised={campaign.amount_raised}
                  goal={campaign.goal}
                  deadline={campaign.deadline}
                  category={CATEGORIES[i % CATEGORIES.length]}
                  artType={ART_TYPES[i % ART_TYPES.length]}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-[var(--text2)] font-light italic">No active campaigns yet. Be the first to create one!</p>
              <Link href="/create" className="mt-4 inline-block text-[var(--teal)] border-b border-[var(--teal)]/30 hover:border-[var(--teal)] transition-all">
                Start a campaign →
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
