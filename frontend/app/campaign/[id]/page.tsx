"use client";

import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Users, Zap, Heart, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  getCampaignById, 
  prepareFundCampaignTx, 
  prepareWithdrawFundsTx, 
  submitTx, 
  pollTx,
  getCampaignEvents
} from "@/lib/contract";
import { Campaign } from "@/lib/types";
import { useWallet } from "@/contexts/WalletContext";
import { rpc } from "@stellar/stellar-sdk";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: ("Education" | "Art" | "Tech" | "Environment")[] = ["Education", "Art", "Tech", "Environment"];

export default function CampaignDetail() {
  const params = useParams();
  const router = useRouter();
  const { address, sign, connect } = useWallet();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("50");
  const [isFunding, setIsFunding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "activity">("about");
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

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

  useEffect(() => {
    async function fetchEvents() {
      if (!campaignId && campaignId !== 0) return;
      setIsLoadingEvents(true);
      try {
        const data = await getCampaignEvents(campaignId);
        setEvents(data);
      } catch (e) {
        console.error("Failed to load events:", e);
      } finally {
        setIsLoadingEvents(false);
      }
    }
    fetchEvents();
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

  const handleWithdraw = async () => {
    if (!address || !campaign) return;

    setIsWithdrawing(true);
    const toastId = toast.loading("Preparing withdrawal...");

    try {
      // 1. Prepare transaction
      const tx = await prepareWithdrawFundsTx(campaign.id, address);
      
      // 2. Sign
      toast.loading("Please sign the withdrawal...", { id: toastId });
      const signResult = await sign(tx.toXDR());
      if (signResult.error || !signResult.signedTxXdr) {
        throw new Error(signResult.error || "Signing cancelled");
      }

      // 3. Submit
      toast.loading("Submitting to network...", { id: toastId });
      const submitResult = await submitTx(signResult.signedTxXdr);
      if (submitResult.status === "ERROR") {
        throw new Error("Transaction failed during submission.");
      }

      // 4. Poll
      toast.loading("Waiting for confirmation...", { id: toastId });
      const finalResult = await pollTx(submitResult.hash);
      
      if (finalResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        toast.success("Funds Withdrawn Successfully!", {
          id: toastId,
          description: "Resources have been transferred to your wallet.",
        });
        
        // Refresh campaign
        const updated = await getCampaignById(campaign.id);
        if (updated) setCampaign(updated);
      } else {
        throw new Error("Transaction failed on-chain.");
      }

    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error("Withdrawal failed", {
        id: toastId,
        description: error.message || "An error occurred.",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 bg-(--bg)">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          <div className="space-y-10">
            <Skeleton className="w-24 h-5 rounded-full" />
            <Skeleton className="w-full h-[280px] md:h-[340px] rounded-[32px]" />
            <div className="space-y-4">
              <Skeleton className="w-32 h-8 rounded-full" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-2/3 h-6" />
            </div>
          </div>
          <aside className="space-y-6 pt-16">
            <Skeleton className="w-full h-96 rounded-2xl" />
          </aside>
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
            className="flex items-center gap-2 text-[0.78rem] text-(--text2) hover:text-(--text) transition-colors mb-8 group"
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
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-none text-(--text) mb-6">
            {campaign.name}
          </h1>
          <p className="text-[1.05rem] text-(--text2) leading-relaxed font-light mb-12">
            {campaign.description}
          </p>

          <div className="bg-(--surface) border border-(--border) rounded-3xl p-8 mb-10">
            <div className="flex justify-between items-baseline mb-5">
              <div className="font-serif text-4xl text-(--text)">
                {raisedNum.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM <span className="font-sans text-[0.85rem] text-(--text2) font-light ml-2 uppercase tracking-wide">raised</span>
              </div>
              <div className="text-[0.85rem] text-(--text2)">
                of {goalNum.toLocaleString()} XLM goal
              </div>
            </div>
            
            <div className="h-2.5 bg-(--surface2) rounded-full mb-8 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-(--teal) to-(--blue) rounded-full"
              />
            </div>

             <div className="grid grid-cols-3 divide-x divide-(--border) border-t border-(--border) pt-8">
              <div className="text-center px-4">
                <div className="text-2xl font-bold tracking-tight text-(--teal)">{percentage}%</div>
                <div className="text-[0.68rem] text-(--text2) uppercase tracking-widest mt-1">Funded</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold tracking-tight text-(--text)">{events.length}</div>
                <div className="text-[0.68rem] text-(--text2) uppercase tracking-widest mt-1">Contributors</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold tracking-tight text-(--teal)">{daysLeft}d</div>
                <div className="text-[0.68rem] text-(--text2) uppercase tracking-widest mt-1">Remaining</div>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex gap-8 border-b border-(--border2) mb-8">
              <button
                onClick={() => setActiveTab("about")}
                className={cn(
                  "pb-4 text-[0.85rem] font-bold tracking-tight transition-all relative",
                  activeTab === "about" ? "text-(--text)" : "text-(--muted-custom) hover:text-(--text2)"
                )}
              >
                About
                {activeTab === "about" && (
                  <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--teal)" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={cn(
                  "pb-4 text-[0.85rem] font-bold tracking-tight transition-all relative",
                  activeTab === "activity" ? "text-(--text)" : "text-(--muted-custom) hover:text-(--text2)"
                )}
              >
                Live Activity
                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-(--surface) text-[0.65rem] border border-(--border2)">
                  {events.length}
                </span>
                {activeTab === "activity" && (
                  <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--teal)" />
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "about" ? (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <p className="text-[0.95rem] text-(--text2) leading-relaxed font-light">
                    {campaign.description}
                  </p>
                  
                  <div className="p-6 rounded-2xl bg-(--surface) border border-(--border) flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-(--bg-tint) flex items-center justify-center text-(--teal)">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[0.85rem] font-bold text-(--text)">Verified Creator</p>
                      <p className="text-[0.7rem] text-(--text2) font-mono">{campaign.creator.slice(0, 16)}...</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {isLoadingEvents ? (
                    <div className="flex flex-col items-center justify-center py-12 text-(--muted-custom)">
                      <Loader2 className="animate-spin mb-4" size={24} />
                      <p className="text-[0.8rem]">Fetching on-chain events...</p>
                    </div>
                  ) : events.length > 0 ? (
                    events.map((event, idx) => (
                      <div 
                        key={event.id || idx}
                        className="flex items-center justify-between p-4 rounded-xl bg-(--surface) border border-(--border2) hover:border-(--teal)/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-(--teal)/10 flex items-center justify-center text-(--teal)">
                            <Heart size={14} fill="currentColor" />
                          </div>
                          <div>
                            <p className="text-[0.8rem] font-medium text-(--text)">
                              {event.funder.slice(0, 6)}...{event.funder.slice(-4)}
                            </p>
                            <p className="text-[0.65rem] text-(--muted-custom)">Contributed</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[0.85rem] font-bold text-(--teal)">+{event.amount} XLM</p>
                          <p className="text-[0.6rem] text-(--muted-custom) font-mono">Ledger {event.ledger}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-(--border2) rounded-2xl">
                      <p className="text-[0.85rem] text-(--muted-custom)">No contributions yet. Be the first!</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="sticky top-24 bg-(--bg) border border-(--border) rounded-2xl p-6 shadow-sm">
            <h3 className="text-[0.7rem] font-bold tracking-widest uppercase text-(--text2) mb-6">Contribute</h3>
            
            <div className="mb-6">
              <label className="block text-[0.72rem] font-medium text-(--muted-custom) mb-3">Quick amounts</label>
              <div className="flex flex-wrap gap-2">
                {["10", "50", "100", "500"].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    onClick={() => setAmount(preset)}
                    className={cn(
                      "w-[3.25rem] h-[3.25rem] rounded-full flex items-center justify-center shrink-0 p-0 text-[0.85rem] font-semibold border transition-all active:scale-95 hover:bg-transparent",
                      amount === preset 
                        ? "bg-[rgba(0,201,167,0.07)] border-(--teal) text-(--teal) hover:text-(--teal)" 
                        : "bg-(--surface2) border-(--border2) text-(--text2) hover:border-(--teal) hover:text-(--text)"
                    )}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-[0.72rem] font-medium text-(--muted-custom) mb-3">Custom amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-auto bg-(--surface2) border border-(--border2) rounded-2xl py-3.5 px-5 text-xl font-bold focus-visible:border-(--teal) focus-visible:ring-4 focus-visible:ring-(--teal)/10 outline-none transition-all"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-(--teal) text-[0.85rem]">XLM</span>
              </div>
            </div>

            {/* Creator Withdrawal Section */}
            {address === campaign.creator && (
              <div className="mb-6 p-4 rounded-2xl bg-(--teal)/5 border border-(--teal)/20">
                <h4 className="flex items-center gap-2 text-[0.7rem] font-bold tracking-widest uppercase text-(--teal) mb-3">
                  <Zap size={12} fill="currentColor" />
                  Creator Controls
                </h4>
                
                {campaign.is_withdrawn ? (
                  <div className="flex items-center gap-2 text-[0.8rem] text-(--teal) py-2">
                    <CheckCircle2 size={16} />
                    <span>Funds already withdrawn</span>
                  </div>
                ) : Number(campaign.amount_raised) >= Number(campaign.goal) ? (
                  <Button 
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    className="w-full bg-(--teal) text-white hover:bg-(--teal)/90 h-11 rounded-xl font-bold shadow-lg shadow-(--teal)/20 transition-all active:scale-95"
                  >
                    {isWithdrawing ? "Processing..." : "Withdraw Funds"}
                  </Button>
                ) : (
                  <div className="flex items-start gap-2 text-[0.75rem] text-(--text2) leading-relaxed">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <p>Goal not yet reached. You can withdraw once the campaign hits {goalNum.toLocaleString()} XLM.</p>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={handleFund}
              disabled={isFunding || campaign.is_withdrawn}
              className="w-full h-auto py-7 rounded-full bg-(--text) text-(--bg) font-bold text-[1rem] shadow-xl shadow-black/20 hover:-translate-y-1 hover:shadow-2xl hover:bg-(--text) transition-all mb-6 relative overflow-hidden"
            >
              {isFunding ? "Processing..." : campaign.is_withdrawn ? "Campaign Completed" : "Fund this campaign →"}
            </Button>

            {isFunding && (
              <div className="text-[0.7rem] text-(--muted-custom) text-center animate-pulse flex items-center justify-center gap-2 mb-6">
                <Clock size={12} />
                Awaiting Stellar confirmation...
              </div>
            )}

            <div className="text-[0.7rem] leading-relaxed text-(--text2) text-center pt-6 border-t border-(--border)">
              Fee ~0.00001 XLM <br />
              Creator: <span className="font-mono text-(--teal) uppercase truncate block mt-1">{campaign.creator}</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
