"use client";

import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const MOCK_CAMPAIGN = {
  id: "1",
  category: "Education" as const,
  name: "Build a coding lab for rural schools",
  description: "Bringing programming education to 500+ students across 3 underserved regions in West Africa. Funds go toward computers, internet, and a 6-month curriculum from local instructors.",
  raised: 7200,
  goal: 10000,
  daysLeft: 8,
  backers: 18,
  artType: "pills" as const,
  address: "CABC...XYZ",
};

const MOCK_FEED = [
  { addr: "GABC...4XZ", time: "2 min ago", amt: "+500 XLM", color: "#1a56db" },
  { addr: "GXYZ...9QR", time: "14 min ago", amt: "+200 XLM", color: "#059669" },
  { addr: "GMUS...7KL", time: "1 hr ago", amt: "+1,000 XLM", color: "#d97706" },
  { addr: "GDEV...2MN", time: "3 hr ago", amt: "+350 XLM", color: "#7c3aed" },
];

export default function CampaignDetail() {
  const params = useParams();
  const router = useRouter();
  const [amount, setAmount] = useState("50");

  const percentage = Math.min(Math.round((MOCK_CAMPAIGN.raised / MOCK_CAMPAIGN.goal) * 100), 100);

  const handleFund = () => {
    toast.success("Transaction Sent to Soroban", {
      description: `Funded ${MOCK_CAMPAIGN.name} with ${amount} XLM.`,
      duration: 5000,
    });
  };

  return (
    <main className="flex-1 bg-[var(--bg)]">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[0.78rem] text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-8 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to campaigns
          </button>

          <div className="h-[280px] md:h-[340px] rounded-[32px] overflow-hidden bg-[#e6faf6] mb-10 flex items-center justify-center relative">
            <svg width="100%" height="100%" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
              <rect width="320" height="200" fill="#e6faf6"/>
              <rect x="20" y="60" width="160" height="28" rx="14" fill="#00c9a7" opacity="0.9"/>
              <circle cx="190" cy="74" r="14" fill="#00c9a7" opacity="0.6"/>
              <rect x="210" y="60" width="70" height="28" rx="14" fill="#00e5bf" opacity="0.75"/>
              <rect x="40" y="102" width="90" height="28" rx="14" fill="#00e5bf" opacity="0.7"/>
              <circle cx="144" cy="116" r="14" fill="#00c9a7" opacity="0.5"/>
              <rect x="168" y="102" width="120" height="28" rx="14" fill="#00c9a7" opacity="0.8"/>
              <rect x="60" y="144" width="180" height="20" rx="10" fill="#00c9a7" opacity="0.4"/>
            </svg>
          </div>

          <Badge className="px-3 py-1 rounded-full text-[0.72rem] font-bold tracking-wider uppercase bg-[#d1fae5] text-[#065f46] hover:bg-[#d1fae5] border-[#a7f3d0] mb-5">
            {MOCK_CAMPAIGN.category}
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-none text-[var(--text)] mb-6">
            {MOCK_CAMPAIGN.name}
          </h1>
          <p className="text-[1.05rem] text-[var(--text2)] leading-relaxed font-light mb-12">
            {MOCK_CAMPAIGN.description}
          </p>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 mb-10">
            <div className="flex justify-between items-baseline mb-5">
              <div className="font-serif text-4xl text-[var(--text)]">
                {MOCK_CAMPAIGN.raised.toLocaleString()} XLM <span className="font-sans text-[0.85rem] text-[var(--muted)] font-light ml-2 uppercase tracking-wide">raised</span>
              </div>
              <div className="text-[0.85rem] text-[var(--muted)]">
                of {MOCK_CAMPAIGN.goal.toLocaleString()} XLM goal
              </div>
            </div>
            
            <div className="h-2.5 bg-[var(--surface2)] rounded-full mb-8 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-[var(--teal)] to-[var(--blue)] rounded-full"
              />
            </div>

            <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-t border-[var(--border)] pt-8">
              <div className="text-center px-4">
                <div className="text-2xl font-bold tracking-tight text-[var(--teal)]">{percentage}%</div>
                <div className="text-[0.68rem] text-[var(--muted)] uppercase tracking-widest mt-1">Funded</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold tracking-tight text-[var(--text)]">{MOCK_CAMPAIGN.backers}</div>
                <div className="text-[0.68rem] text-[var(--muted)] uppercase tracking-widest mt-1">Contributors</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold tracking-tight text-[var(--teal)]">{MOCK_CAMPAIGN.daysLeft}d</div>
                <div className="text-[0.68rem] text-[var(--muted)] uppercase tracking-widest mt-1">Remaining</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
            <div className="flex items-center gap-2 text-[0.7rem] font-bold tracking-widest uppercase text-[var(--muted)] mb-6">
              <div className="w-2 h-2 rounded-full bg-[var(--teal)] animate-pulse" />
              Live Contributions
            </div>
            
            <div className="divide-y divide-[var(--border)]">
              {MOCK_FEED.map((item, i) => (
                <div key={i} className="py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: item.color }}>
                    G
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-[0.75rem] text-[var(--text2)]">{item.addr}</div>
                    <div className="text-[0.65rem] text-[var(--muted)] mt-0.5">{item.time}</div>
                  </div>
                  <div className="text-[0.9rem] font-bold text-[var(--teal)]">{item.amt}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="sticky top-24 bg-[var(--surface)] border border-[var(--border)] rounded-[32px] p-8">
            <h3 className="text-[0.7rem] font-bold tracking-widest uppercase text-[var(--muted)] mb-6">Contribute</h3>
            
            <div className="mb-6">
              <label className="block text-[0.72rem] font-medium text-[var(--muted-custom)] mb-3">Quick amounts</label>
              <div className="flex flex-wrap gap-2">
                {["10", "50", "100", "500"].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    onClick={() => setAmount(preset)}
                    className={cn(
                      "px-4 py-6 rounded-full text-[0.8rem] font-semibold border transition-all active:scale-95 hover:bg-transparent h-auto",
                      amount === preset 
                        ? "bg-[rgba(0,201,167,0.07)] border-[var(--teal)] text-[var(--teal)] hover:text-[var(--teal)]" 
                        : "bg-[var(--surface2)] border-[var(--border2)] text-[var(--text2)] hover:border-[var(--teal)] hover:text-[var(--text)]"
                    )}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-[0.72rem] font-medium text-[var(--muted-custom)] mb-3">Custom amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-auto bg-[var(--surface2)] border border-[var(--border2)] rounded-2xl py-3.5 px-5 text-xl font-bold focus-visible:border-[var(--teal)] focus-visible:ring-4 focus-visible:ring-[var(--teal)]/10 outline-none transition-all"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-[var(--teal)] text-[0.85rem]">XLM</span>
              </div>
            </div>

            <Button 
              onClick={handleFund}
              className="w-full h-auto py-7 rounded-full bg-[var(--text)] text-[var(--bg)] font-bold text-[1rem] shadow-xl shadow-black/20 hover:-translate-y-1 hover:shadow-2xl hover:bg-[var(--text)] transition-all mb-6 relative overflow-hidden"
            >
              Fund this campaign →
            </Button>

            <div className="text-[0.7rem] text-[var(--muted-custom)] text-center animate-pulse flex items-center justify-center gap-2 mb-6">
              <Clock size={12} />
              Awaiting Stellar confirmation...
            </div>

            <div className="text-[0.7rem] leading-relaxed text-[var(--muted)] text-center pt-6 border-t border-[var(--border)]">
              Fee ~0.00001 XLM <br />
              Contract: <span className="font-mono text-[var(--teal)] uppercase">{MOCK_CAMPAIGN.address}</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
