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
import { MOCK_CAMPAIGNS } from "@/lib/data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  MoreVertical,
  Plus,
} from "lucide-react";

export default function ExplorePage() {
  const router = useRouter();

  return (
    <main className="flex-1 bg-[var(--bg)] min-h-screen">
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
            <button className="px-4 py-1.5 rounded-full bg-[var(--surface)] font-medium text-[var(--text)] border border-[var(--border2)] transition-colors">
              All Campaigns
            </button>
            <button className="px-4 py-1.5 rounded-full text-[var(--text2)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5">
              Live Projects <span className="flex items-center justify-center bg-[var(--surface2)] text-[0.7rem] w-5 h-5 rounded-full">3</span>
            </button>
            <button className="px-4 py-1.5 rounded-full text-[var(--text2)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5">
              Funded <span className="flex items-center justify-center bg-[var(--surface2)] text-[0.7rem] w-5 h-5 rounded-full">1</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[0.85rem] font-medium hover:bg-[var(--surface)] transition-colors">
              <Columns size={16} /> Customize Columns
            </button>
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[0.85rem] font-medium bg-[var(--text)] text-[var(--bg)] hover:opacity-90 transition-opacity"
            >
              Create Campaign
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="rounded-xl border border-[var(--border2)] bg-[var(--bg)] shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[var(--surface)] select-none">
                <TableRow className="border-b-[var(--border2)] hover:bg-transparent">
                  <TableHead className="w-[30%] text-[var(--text)] font-semibold h-12">Campaign Name</TableHead>
                  <TableHead className="text-[var(--text)] font-semibold h-12">Category</TableHead>
                  <TableHead className="text-[var(--text)] font-semibold h-12">Status</TableHead>
                  <TableHead className="text-[var(--text)] font-semibold h-12 hidden md:table-cell">Goal</TableHead>
                  <TableHead className="text-[var(--text)] font-semibold h-12 hidden md:table-cell">Raised</TableHead>
                  <TableHead className="text-[var(--text)] font-semibold h-12">Days Left</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_CAMPAIGNS.map((campaign) => {
                  const isEndingSoon = campaign.daysLeft < 3;
                  const isFunded = campaign.raised >= campaign.goal;
                  
                  return (
                    <TableRow
                      key={campaign.id}
                      onClick={() => router.push(`/campaign/${campaign.id}`)}
                      className="cursor-pointer border-b-[var(--border2)] hover:bg-[var(--surface)]/50 transition-colors group h-16"
                    >
                      <TableCell className="font-medium text-[0.95rem] text-[var(--text)] group-hover:text-[var(--teal)] transition-colors">
                        {campaign.name}
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="rounded-full text-[0.7rem] bg-[var(--card-bg)] font-medium text-[var(--text2)] border-[var(--border2)] shadow-none px-2.5 py-0.5 whitespace-nowrap">
                          {campaign.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[var(--border2)] text-[0.7rem] font-medium bg-[var(--card-bg)] text-[var(--text)] whitespace-nowrap">
                          {isFunded ? (
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          ) : (
                            <svg className="w-3 h-3 text-[var(--text2)] animate-[spin_3s_linear_infinite]" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 30" strokeLinecap="round" />
                            </svg>
                          )}
                          {isFunded ? "Funded" : "Active"}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-[0.88rem] text-[var(--text)] hidden md:table-cell">
                        {campaign.goal.toLocaleString()} XLM
                      </TableCell>

                      <TableCell className="text-[0.88rem] text-[var(--text)] hidden md:table-cell">
                        {campaign.raised.toLocaleString()} XLM
                      </TableCell>

                      <TableCell className="text-[0.9rem] text-[var(--text)]">
                        {campaign.daysLeft}
                      </TableCell>

                      <TableCell className="text-right text-[var(--muted-custom)] group-hover:text-[var(--text)] transition-colors">
                        <MoreVertical size={16} className="ml-auto" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border2)] bg-[var(--bg)] text-[0.85rem] text-[var(--text2)]">
            <div className="hidden sm:block">
              0 of {MOCK_CAMPAIGNS.length} row(s) selected.
            </div>
            
            <div className="flex flex-1 sm:flex-none items-center justify-between sm:justify-end gap-6 sm:gap-8">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <button className="flex items-center gap-1 border border-[var(--border2)] rounded-md px-2 py-1 bg-[var(--surface)] text-[var(--text)] font-medium">
                  10
                  <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
              </div>
              
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md border border-[var(--border2)] bg-[var(--surface)] text-[var(--muted-custom)] cursor-not-allowed">
                  <ChevronsLeft size={14} />
                </button>
                <button className="p-1.5 rounded-md border border-[var(--border2)] bg-[var(--surface)] text-[var(--muted-custom)] cursor-not-allowed">
                  <ChevronLeft size={14} />
                </button>
                <button className="p-1.5 rounded-md border border-[var(--border2)] bg-[var(--surface)] text-[var(--muted-custom)] cursor-not-allowed">
                  <ChevronRight size={14} />
                </button>
                <button className="p-1.5 rounded-md border border-[var(--border2)] bg-[var(--surface)] text-[var(--muted-custom)] cursor-not-allowed">
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
