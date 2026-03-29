"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CampaignCardProps {
  id: string;
  category: "Education" | "Art" | "Tech" | "Environment";
  name: string;
  description: string;
  raised: number;
  goal: number;
  daysLeft: number;
  backers: number;
  artType: "pills" | "circles" | "semis" | "health";
}

export default function CampaignCard({
  id,
  category,
  name,
  description,
  raised,
  goal,
  daysLeft,
  backers,
  artType,
}: CampaignCardProps) {
  const percentage = Math.min(Math.round((raised / goal) * 100), 100);

  const categoryStyles = {
    Education: "text-[#065f46] bg-[#d1fae5] border-[#a7f3d0] dark:text-[#6ee7b7] dark:bg-[#6ee7b7]/10 dark:border-[#6ee7b7]/20",
    Art: "text-[#7c2d12] bg-[#ffedd5] border-[#fdba74] dark:text-[#fdba74] dark:bg-[#fdba74]/10 dark:border-[#fdba74]/20",
    Tech: "text-[#3730a3] bg-[#ede9fe] border-[#c4b5fd] dark:text-[#c4b5fd] dark:bg-[#c4b5fd]/10 dark:border-[#c4b5fd]/20",
    Environment: "text-[#1e3a5f] bg-[#dbeafe] border-[#93c5fd] dark:text-[#93c5fd] dark:bg-[#93c5fd]/10 dark:border-[#93c5fd]/20",
  };

  const artBackgrounds = {
    pills: "bg-[#e6faf6]",
    circles: "bg-[#fef9ee]",
    semis: "bg-[#f0f4ff]",
    health: "bg-[#fffbeb]",
  };

  return (
    <Link href={`/campaign/${id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group overflow-hidden rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300"
      >
        <div className={cn("h-40 relative flex items-center justify-center overflow-hidden", artBackgrounds[artType])}>
          {renderArt(artType)}
        </div>

        <div className="p-5 flex flex-col items-start">
          <Badge className={cn("inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[0.68rem] font-bold tracking-wider uppercase border mb-3 shadow-none hover:bg-transparent transition-none", categoryStyles[category])}>
            {category}
          </Badge>
          <h3 className="text-[0.95rem] font-semibold leading-snug tracking-tight mb-2 group-hover:text-[var(--teal)] transition-colors">
            {name}
          </h3>
          <p className="text-[0.78rem] text-[var(--text2)] leading-relaxed font-light mb-4 line-clamp-2">
            {description}
          </p>

          <div className="h-1 bg-[var(--border2)] rounded-full mb-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${percentage}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  artType === "pills"
                    ? "linear-gradient(90deg, #00C9A7, #00E5BF)"
                    : artType === "circles"
                    ? "linear-gradient(90deg, #E85D26, #FB923C)"
                    : artType === "semis"
                    ? "linear-gradient(90deg, #4F7BFF, #7BA8FF)"
                    : "linear-gradient(90deg, #F59E0B, #FBBF24)",
              }}
            />
          </div>

          <div className="flex justify-between items-center mb-3.5">
            <div className="text-[0.82rem] font-bold tracking-tight">
              {raised.toLocaleString()} <span className="text-[0.72rem] font-normal text-[var(--muted-custom)]">/ {goal.toLocaleString()} XLM</span>
            </div>
            <div className={cn("text-[0.7rem] font-medium", daysLeft < 3 ? "text-[#E85D26] font-bold" : "text-[var(--muted-custom)]")}>
              {daysLeft < 3 ? `🔥 ${daysLeft} days left` : `⏱ ${daysLeft} days left`}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3.5 border-t border-[var(--border)]">
            <span className="text-[0.72rem] text-[var(--muted-custom)]">{backers} backers</span>
            <span className={cn("px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold", percentage > 90 ? "bg-[#d1fae5] text-[#059669]" : "bg-[var(--surface2)] text-[var(--text2)]")}>
              {percentage}%
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function renderArt(type: string) {
  switch (type) {
    case "pills":
      return (
        <div className="w-full h-full p-5 flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <div className="flex-[3] h-5 rounded-full bg-[#00c9a7]" />
            <div className="w-5 h-5 rounded-full bg-[#00c9a7] opacity-80" style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)" }} />
            <div className="flex-[1.5] h-5 rounded-full bg-[#00e5bf] opacity-70" />
            <div className="flex-1 h-5 rounded-full bg-[#00c9a7] opacity-50" />
          </div>
          <div className="flex gap-2 items-center pl-5">
            <div className="flex-1 h-5 rounded-full bg-[#00c9a7] opacity-50" />
            <div className="flex-[2.5] h-5 rounded-full bg-[#00e5bf] opacity-70" />
            <div className="w-5 h-5 rounded-full bg-[#00c9a7] opacity-80" style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)" }} />
            <div className="flex-[1.5] h-5 rounded-full bg-[#00c9a7]" />
          </div>
          <div className="flex gap-2 items-center pl-10">
            <div className="w-5 h-5 rounded-full bg-[#00c9a7] opacity-60" style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)" }} />
            <div className="flex-[2] h-5 rounded-full bg-[#00c9a7] opacity-80" />
            <div className="flex-[1.2] h-5 rounded-full bg-[#00c9a7] opacity-50" />
          </div>
        </div>
      );
    case "circles":
      return (
        <svg width="160" height="130" viewBox="0 0 160 130" className="mt-auto">
          <circle cx="20" cy="110" r="16" fill="#e85d26" opacity="0.9" />
          <circle cx="52" cy="110" r="16" fill="#e85d26" opacity="0.75" />
          <circle cx="84" cy="110" r="16" fill="#f0a07a" opacity="0.9" />
          <circle cx="116" cy="110" r="16" fill="#f0a07a" opacity="0.75" />
          <circle cx="148" cy="110" r="16" fill="#e85d26" opacity="0.6" />
          <circle cx="36" cy="78" r="16" fill="#e85d26" opacity="0.8" />
          <circle cx="68" cy="78" r="16" fill="#f0a07a" opacity="0.9" />
          <circle cx="100" cy="78" r="16" fill="#e85d26" opacity="0.7" />
          <circle cx="132" cy="78" r="16" fill="#f0a07a" opacity="0.6" />
          <circle cx="52" cy="46" r="16" fill="#e85d26" opacity="0.75" />
          <circle cx="84" cy="46" r="16" fill="#f0a07a" opacity="0.8" />
          <circle cx="116" cy="46" r="16" fill="#e85d26" opacity="0.65" />
          <circle cx="84" cy="14" r="16" fill="#e85d26" opacity="0.9" />
        </svg>
      );
    case "semis":
      return (
        <div className="flex items-center gap-4">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <path d="M45 0 A45 45 0 0 1 90 45 L45 45 Z" fill="#4f7bff" opacity="0.9" />
            <path d="M0 45 A45 45 0 0 1 45 0 L45 45 Z" fill="#7ba8ff" opacity="0.7" />
            <path d="M45 90 A45 45 0 0 1 0 45 L45 45 Z" fill="#4f7bff" opacity="0.5" />
            <path d="M90 45 A45 45 0 0 1 45 90 L45 45 Z" fill="#7ba8ff" opacity="0.8" />
            <circle cx="45" cy="45" r="18" fill="#f0f4ff" />
          </svg>
          <svg width="60" height="60" viewBox="0 0 60 60" className="mt-5">
            <path d="M30 0 A30 30 0 0 1 60 30 L30 30 Z" fill="#c084fc" opacity="0.85" />
            <path d="M0 30 A30 30 0 0 1 30 0 L30 30 Z" fill="#a855f7" opacity="0.6" />
            <path d="M30 60 A30 30 0 0 1 0 30 L30 30 Z" fill="#c084fc" opacity="0.7" />
            <path d="M60 30 A30 30 0 0 1 30 60 L30 30 Z" fill="#a855f7" opacity="0.9" />
            <circle cx="30" cy="30" r="12" fill="#f0f4ff" />
          </svg>
        </div>
      );
    case "health":
      return (
        <svg width="140" height="110" viewBox="0 0 140 110">
          <path d="M10 100 A60 60 0 0 1 130 100 Z" fill="#fbbf24" opacity="0.85" />
          <path d="M25 100 A45 45 0 0 1 115 100 Z" fill="#fde68a" opacity="0.9" />
          <path d="M40 100 A30 30 0 0 1 100 100 Z" fill="#fffbeb" />
          <circle cx="70" cy="60" r="18" fill="#f59e0b" opacity="0.9" />
          <circle cx="70" cy="60" r="10" fill="#fbbf24" />
        </svg>
      );
  }
}
