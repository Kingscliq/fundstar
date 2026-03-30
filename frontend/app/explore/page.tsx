"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { getAllCampaigns } from "@/lib/contract";
import { Campaign } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  MoreVertical,
} from "lucide-react";

const CATEGORIES: ("Education" | "Art" | "Tech" | "Environment")[] = ["Education", "Art", "Tech", "Environment"];

export default function ExplorePage() {
  const router = useRouter();
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
    <main className="flex-1 bg-(--bg) min-h-screen">
      <Navbar />
      
      <div className="py-12 px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center justify-between"
        >
          {/* Top Tabs */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button className="px-4 py-1.5 rounded-full bg-(--surface) font-medium text-(--text) border border-(--border2) transition-colors">
              All Campaigns
            </button>
            <button className="px-4 py-1.5 rounded-full text-(--text2) hover:text-(--text) transition-colors flex items-center gap-1.5">
              Live Projects <span className="flex items-center justify-center bg-(--surface2) text-[0.7rem] w-5 h-5 rounded-full">{campaigns.length}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) text-[0.85rem] font-medium hover:bg-(--surface) transition-colors">
              <Columns size={16} /> Customize Columns
            </button>
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) text-[0.85rem] font-medium bg-(--text) text-(--bg) hover:opacity-90 transition-opacity"
            >
              Create Campaign
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="rounded-xl border border-(--border2) bg-(--bg) shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-(--surface) select-none">
                <TableRow className="border-b-(--border2) hover:bg-transparent">
                  <TableHead className="w-[30%] text-(--text) font-semibold h-12">Campaign Name</TableHead>
                  <TableHead className="text-(--text) font-semibold h-12">Category</TableHead>
                  <TableHead className="text-(--text) font-semibold h-12">Status</TableHead>
                  <TableHead className="text-(--text) font-semibold h-12 hidden md:table-cell">Goal</TableHead>
                  <TableHead className="text-(--text) font-semibold h-12 hidden md:table-cell">Raised</TableHead>
                  <TableHead className="text-(--text) font-semibold h-12">Days Left</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={7} className="h-16 pr-0">
                        <div className="w-full h-8 bg-(--surface) rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : campaigns.length > 0 ? (
                  campaigns.map((campaign, i) => {
                    const raisedNum = Number(campaign.amount_raised) / 10_000_000;
                    const goalNum = Number(campaign.goal) / 10_000_000;
                    const isFunded = raisedNum >= goalNum;
                    
                    const deadlineSec = Number(campaign.deadline);
                    const nowSec = Math.floor(Date.now() / 1000);
                    const daysLeft = Math.max(0, Math.ceil((deadlineSec - nowSec) / 86400));
                    
                    const category = CATEGORIES[i % CATEGORIES.length];

                    return (
                      <TableRow
                        key={campaign.id}
                        onClick={() => router.push(`/campaign/${campaign.id}`)}
                        className="cursor-pointer border-b-(--border2) hover:bg-(--surface)/50 transition-colors group h-16"
                      >
                        <TableCell className="font-medium text-[0.95rem] text-(--text) group-hover:text-(--teal) transition-colors">
                          {campaign.name}
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="rounded-full text-[0.7rem] bg-(--card-bg) font-medium text-(--text2) border-(--border2) shadow-none px-2.5 py-0.5 whitespace-nowrap">
                            {category}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-(--border2) text-[0.7rem] font-medium bg-(--card-bg) text-(--text) whitespace-nowrap">
                            {isFunded ? (
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            ) : (
                              <svg className="w-3 h-3 text-(--text2) animate-[spin_3s_linear_infinite]" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 30" strokeLinecap="round" />
                              </svg>
                            )}
                            {isFunded ? "Funded" : "Active"}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-[0.88rem] text-(--text) hidden md:table-cell">
                          {goalNum.toLocaleString()} XLM
                        </TableCell>

                        <TableCell className="text-[0.88rem] text-(--text) hidden md:table-cell">
                          {raisedNum.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM
                        </TableCell>

                        <TableCell className="text-[0.9rem] text-(--text)">
                          {daysLeft}
                        </TableCell>

                        <TableCell className="text-right text-(--muted-custom) group-hover:text-(--text) transition-colors">
                          <MoreVertical size={16} className="ml-auto" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-(--text2) italic">
                      No campaigns found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-(--border2) bg-(--bg) text-[0.85rem] text-(--text2)">
            <div className="hidden sm:block">
              {campaigns.length} row(s) total.
            </div>
            
            <div className="flex flex-1 sm:flex-none items-center justify-between sm:justify-end gap-6 sm:gap-8">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <button className="flex items-center gap-1 border border-(--border2) rounded-md px-2 py-1 bg-(--surface) text-(--text) font-medium">
                  10
                  <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
              </div>
              
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md border border-(--border2) bg-(--surface) text-(--muted-custom) cursor-not-allowed">
                  <ChevronsLeft size={14} />
                </button>
                <button className="p-1.5 rounded-md border border-(--border2) bg-(--surface) text-(--muted-custom) cursor-not-allowed">
                  <ChevronLeft size={14} />
                </button>
                <button className="p-1.5 rounded-md border border-(--border2) bg-(--surface) text-(--muted-custom) cursor-not-allowed">
                  <ChevronRight size={14} />
                </button>
                <button className="p-1.5 rounded-md border border-(--border2) bg-(--surface) text-(--muted-custom) cursor-not-allowed">
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
