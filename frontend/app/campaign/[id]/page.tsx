"use client";

import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getCampaignById, prepareFundCampaignTx, submitTx, pollTx } from "@/lib/contract";
import { Campaign } from "@/lib/types";
import { useWallet } from "@/contexts/WalletContext";
import { rpc } from "@stellar/stellar-sdk";

const CATEGORIES: ("Education" | "Art" | "Tech" | "Environment")[] = ["Education", "Art", "Tech", "Environment"];

export default function CampaignDetail() {
  const params = useParams();
  const router = useRouter();
  const { address, sign, connect } = useWallet();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("50");
  const [isFunding, setIsFunding] = useState(false);

  const campaignId = Number(params?.id);

  useEffect(() => {
    async function loadCampaign() {
      if (!campaignId && campaignId !== 0) return;
      try {
        const data = await getCampaignById(campaignId);
        setCampaign(data);
      } catch (error) {
        console.error("Failed to load campaign:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCampaign();
  }, [campaignId]);

  const handleFund = async () => {
    if (!address) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to fund this campaign.",
        action: {
          label: "Connect",
          onClick: () => connect(),
        },
      });
      return;
    }

    if (!campaign) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid amount to fund.",
      });
      return;
    }

    setIsFunding(true);
    toast.loading("Preparing transaction...", { id: "funding-toast" });

    try {
      // 1. Prepare transaction
      const tx = await prepareFundCampaignTx(campaign.id, address, amountNum);
      
      // 2. Sign with Freighter
      toast.loading("Please sign the transaction in Freighter...", { id: "funding-toast" });
      const signResult = await sign(tx.toXDR());
      
      if (signResult.error || !signResult.signedTxXdr) {
        throw new Error(signResult.error || "Signing cancelled");
      }

      // 3. Submit to network
      toast.loading("Submitting to Stellar network...", { id: "funding-toast" });
      const submitResult = await submitTx(signResult.signedTxXdr);
      
      if (submitResult.status === "ERROR") {
        console.error("Submission error details:", submitResult);
        throw new Error(`Transaction submission failed: ${submitResult.errorResult || "Check console for details"}`);
      }

      // 4. Poll for finality
      toast.loading("Transaction submitted! Waiting for confirmation...", { id: "funding-toast" });
      const finalResult = await pollTx(submitResult.hash);
      
      if (finalResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        toast.success("Contribution Successful!", {
          id: "funding-toast",
          description: `You successfully funded ${campaign.name} with ${amount} XLM.`,
        });
        
        // Refresh campaign data
        const updated = await getCampaignById(campaign.id);
        if (updated) setCampaign(updated);
      } else {
        throw new Error("Transaction failed on-chain.");
      }

    } catch (error: any) {
      console.error("Funding error:", error);
      toast.error("Funding failed", {
        id: "funding-toast",
        description: error.message || "An error occurred during the transaction.",
      });
    } finally {
      setIsFunding(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 bg-(--bg)">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-full h-64 bg-[var(--surface)] rounded-[32px] mb-8" />
            <div className="w-2/3 h-12 bg-[var(--surface)] rounded-lg mb-4" />
            <div className="w-1/2 h-6 bg-[var(--surface)] rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="flex-1 bg-(--bg)">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-serif mb-4">Campaign not found</h1>
          <Button onClick={() => router.push("/explore")}>Back to Explore</Button>
        </div>
      </main>
    );
  }

  const raisedNum = Number(campaign.amount_raised) / 10_000_000;
  const goalNum = Number(campaign.goal) / 10_000_000;
  const percentage = goalNum > 0 ? Math.min(Math.round((raisedNum / goalNum) * 100), 100) : 0;
  
  const deadlineSec = Number(campaign.deadline);
  const nowSec = Math.floor(Date.now() / 1000);
  const daysLeft = Math.max(0, Math.ceil((deadlineSec - nowSec) / 86400));
  
  const category = CATEGORIES[campaign.id % CATEGORIES.length];

  return (
    <main className="flex-1 bg-(--bg)">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[0.78rem] text-[var(--text2)] hover:text-[var(--text)] transition-colors mb-8 group"
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
            {category}
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-none text-[var(--text)] mb-6">
            {campaign.name}
          </h1>
          <p className="text-[1.05rem] text-[var(--text2)] leading-relaxed font-light mb-12">
            {campaign.description}
          </p>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 mb-10">
            <div className="flex justify-between items-baseline mb-5">
              <div className="font-serif text-4xl text-[var(--text)]">
                {raisedNum.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM <span className="font-sans text-[0.85rem] text-[var(--text2)] font-light ml-2 uppercase tracking-wide">raised</span>
              </div>
              <div className="text-[0.85rem] text-[var(--text2)]">
                of {goalNum.toLocaleString()} XLM goal
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
                <div className="text-[0.68rem] text-[var(--text2)] uppercase tracking-widest mt-1">Funded</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold tracking-tight text-[var(--text)]">0</div>
                <div className="text-[0.68rem] text-[var(--text2)] uppercase tracking-widest mt-1">Contributors</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold tracking-tight text-[var(--teal)]">{daysLeft}d</div>
                <div className="text-[0.68rem] text-[var(--text2)] uppercase tracking-widest mt-1">Remaining</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[0.7rem] font-bold tracking-widest uppercase text-[var(--text2)] mb-6">
              <div className="w-2 h-2 rounded-full bg-[var(--teal)] animate-pulse" />
              Live Contributions
            </div>
            
            <div className="divide-y divide-[var(--border)] text-center py-10">
              <p className="text-[var(--text2)] text-sm italic font-light">Soon: Live feed integration</p>
            </div>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="sticky top-24 bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[0.7rem] font-bold tracking-widest uppercase text-[var(--text2)] mb-6">Contribute</h3>
            
            <div className="mb-6">
              <label className="block text-[0.72rem] font-medium text-[var(--muted-custom)] mb-3">Quick amounts</label>
              <div className="flex flex-wrap gap-2">
                {["10", "50", "100", "500"].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    onClick={() => setAmount(preset)}
                    className={cn(
                      "w-[3.25rem] h-[3.25rem] rounded-full flex items-center justify-center shrink-0 p-0 text-[0.85rem] font-semibold border transition-all active:scale-95 hover:bg-transparent",
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
              disabled={isFunding}
              className="w-full h-auto py-7 rounded-full bg-[var(--text)] text-[var(--bg)] font-bold text-[1rem] shadow-xl shadow-black/20 hover:-translate-y-1 hover:shadow-2xl hover:bg-[var(--text)] transition-all mb-6 relative overflow-hidden"
            >
              {isFunding ? "Processing..." : "Fund this campaign →"}
            </Button>

            {isFunding && (
              <div className="text-[0.7rem] text-[var(--muted-custom)] text-center animate-pulse flex items-center justify-center gap-2 mb-6">
                <Clock size={12} />
                Awaiting Stellar confirmation...
              </div>
            )}

            <div className="text-[0.7rem] leading-relaxed text-[var(--text2)] text-center pt-6 border-t border-[var(--border)]">
              Fee ~0.00001 XLM <br />
              Creator: <span className="font-mono text-[var(--teal)] uppercase truncate block mt-1">{campaign.creator}</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
