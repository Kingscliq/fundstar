"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, DollarSign, Tag, Info, Wallet, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { prepareCreateCampaignTx, submitTx, getCampaignCount, pollTx } from "@/lib/contract";
import { rpc } from "@stellar/stellar-sdk";
import { useRouter } from "next/navigation";

export default function CreateCampaign() {
  const { address, connect, isConnecting, sign } = useWallet();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "Build a solar well in Kaduna",
    description: "Funding a solar-powered water pump to serve 200 families with clean water year-round.",
    goal: "15000",
    deadline: "2026-12-31",
    category: "Tech",
  });

  const categories = ["Education", "Environment", "Tech", "Art", "Community"];

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    const goalNum = parseFloat(formData.goal);
    if (isNaN(goalNum) || goalNum <= 0) {
      toast.error("Invalid goal amount");
      return;
    }

    const deadlineUnix = Math.floor(new Date(formData.deadline).getTime() / 1000);
    if (deadlineUnix <= Math.floor(Date.now() / 1000)) {
      toast.error("Deadline must be in the future");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Preparing transaction...", { id: "create-toast" });

    try {
      // 1. Prepare transaction
      const tx = await prepareCreateCampaignTx(
        address,
        formData.name,
        formData.description,
        goalNum,
        deadlineUnix
      );
      
      // 2. Sign with Freighter
      toast.loading("Please sign the transaction in Freighter...", { id: "create-toast" });
      const signResult = await sign(tx.toXDR());
      
      if (signResult.error || !signResult.signedTxXdr) {
        throw new Error(signResult.error || "Signing cancelled");
      }

      // 3. Submit to network
      toast.loading("Submitting to Stellar network...", { id: "create-toast" });
      const submitResult = await submitTx(signResult.signedTxXdr);
      
      if (submitResult.status === "ERROR") {
        console.error("Submission error details:", submitResult);
        const errorMsg = typeof submitResult.errorResult === 'object' ? JSON.stringify(submitResult.errorResult) : submitResult.errorResult || submitResult.status;
        throw new Error(`Transaction submission failed: ${errorMsg}`);
      }

      // 4. Poll for finality
      toast.loading("Transaction submitted! Confirming on-chain...", { id: "create-toast" });
      const finalResult = await pollTx(submitResult.hash);
      
      if (finalResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        toast.success("Campaign Created Successfully!", {
          id: "create-toast",
          description: `Your campaign "${formData.name}" is now live on Stellar.`,
        });
        
        // Find the new campaign ID
        const count = await getCampaignCount();
        const newId = count - 1;
        
        // Redirect to the new campaign page
        router.push(`/campaign/${newId}`);
      } else {
        throw new Error("Transaction failed on-chain.");
      }

    } catch (error: any) {
      console.error("Creation error:", error);
      toast.error("Failed to create campaign", {
        id: "create-toast",
        description: error.message || "An error occurred during the transaction.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 bg-[var(--bg)]">
      <Navbar />

      <div className="max-w-xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="h-32 rounded-3xl bg-[var(--bg-tint)] mb-10 overflow-hidden relative flex items-center justify-center">
            <svg
              width="100%"
              height="120"
              viewBox="0 0 560 120"
              preserveAspectRatio="xMidYMid slice"
              className="opacity-60"
            >
              <rect x="20" y="40" width="120" height="22" rx="11" fill="#00c9a7" opacity="0.5" />
              <rect x="160" y="28" width="80" height="22" rx="11" fill="#4f7bff" opacity="0.4" />
              <circle cx="258" cy="50" r="20" fill="#e85d26" opacity="0.3" />
              <rect x="290" y="40" width="100" height="22" rx="11" fill="#fbbf24" opacity="0.4" />
              <circle cx="410" cy="39" r="15" fill="#00c9a7" opacity="0.35" />
              <rect x="435" y="50" width="90" height="18" rx="9" fill="#4f7bff" opacity="0.3" />
            </svg>
          </div>

          <div className="mb-10">
            <div className="text-[0.7rem] font-bold tracking-widest uppercase text-[var(--teal)] mb-3">
              ✦ Launch Your Idea
            </div>
            <h1 className="font-serif text-4xl tracking-tight text-[var(--text)] mb-3">
              New campaign
            </h1>
            <p className="text-[0.9rem] text-[var(--text2)] leading-relaxed font-light">
              Start your fundraising journey in seconds. Share your story, set a
              goal, and launch your campaign globally.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-[0.75rem] font-semibold text-[var(--muted-custom)] uppercase tracking-wide px-1 flex items-center gap-2">
                <Tag size={12} /> Campaign Name
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full h-auto bg-[var(--surface)] border border-[var(--border2)] rounded-2xl py-3.5 px-5 text-[0.95rem] focus-visible:border-[var(--teal)] focus-visible:ring-4 focus-visible:ring-[var(--teal)]/10 outline-none transition-all placeholder:text-[var(--muted-custom)]"
                placeholder="Give your campaign a clear name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[0.75rem] font-semibold text-[var(--muted-custom)] uppercase tracking-wide px-1 flex items-center gap-2">
                <Info size={12} /> Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-[var(--surface)] border border-[var(--border2)] rounded-2xl py-3.5 px-5 text-[0.9rem] min-h-[120px] resize-none focus-visible:border-[var(--teal)] focus-visible:ring-4 focus-visible:ring-[var(--teal)]/10 outline-none transition-all font-light leading-relaxed"
                placeholder="Describe your campaign mission..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[0.75rem] font-semibold text-[var(--muted-custom)] uppercase tracking-wide px-1 flex items-center gap-2">
                  <DollarSign size={12} /> Goal (XLM)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.goal}
                    onChange={e =>
                      setFormData({ ...formData, goal: e.target.value })
                    }
                    className="w-full h-auto bg-[var(--surface)] border border-[var(--border2)] rounded-2xl py-3.5 px-5 text-[1rem] font-bold pr-14 focus-visible:border-[var(--teal)] focus-visible:ring-4 focus-visible:ring-[var(--teal)]/10 outline-none transition-all"
                    required
                    min="1"
                    disabled={isSubmitting}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[0.8rem] font-bold text-[var(--teal)]">
                    XLM
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[0.75rem] font-semibold text-[var(--muted-custom)] uppercase tracking-wide px-1 flex items-center gap-2">
                  <Calendar size={12} /> Deadline
                </Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={e =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full h-auto bg-[var(--surface)] border border-[var(--border2)] rounded-2xl py-3.5 px-5 text-[0.9rem] focus-visible:border-[var(--teal)] focus-visible:ring-4 focus-visible:ring-[var(--teal)]/10 outline-none transition-all block"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[0.75rem] font-semibold text-[var(--muted-custom)] uppercase tracking-wide px-1 flex items-center gap-2">
                Category
              </Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    disabled={isSubmitting}
                    className={cn(
                      "px-5 py-5 rounded-full text-[0.82rem] font-medium border transition-all hover:bg-transparent",
                      formData.category === cat
                        ? "bg-[rgba(0,201,167,0.07)] border-[var(--teal)] text-[var(--teal)] hover:text-[var(--teal)]"
                        : "bg-[var(--surface)] border-[var(--border2)] text-[var(--muted-custom)] hover:border-[var(--teal)] hover:text-[var(--text)]"
                    )}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {address ? (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-7 h-auto rounded-full bg-[var(--text)] text-[var(--bg)] font-bold text-[1rem] shadow-xl shadow-black/20 hover:-translate-y-1 hover:shadow-2xl hover:bg-[var(--text)] transition-all mt-4 relative overflow-hidden"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Deploying to Stellar...
                  </span>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                  <Wallet size={16} className="text-[var(--text2)] shrink-0" />
                  <p className="text-[0.82rem] text-[var(--text2)]">
                    Connect your wallet to launch your campaign
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={connect}
                  disabled={isConnecting}
                  className="w-full py-7 h-auto rounded-full bg-[var(--text)] text-[var(--bg)] font-bold text-[1rem] shadow-xl shadow-black/20 hover:-translate-y-1 hover:shadow-2xl hover:bg-[var(--text)] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isConnecting
                    ? "Connecting..."
                    : "Connect Wallet to Continue"}
                </Button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </main>
  );
}
