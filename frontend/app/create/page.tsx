'use client';

import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, DollarSign, Tag, Info, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CreateCampaign() {
  const [formData, setFormData] = useState({
    name: 'Build a solar well in Kaduna',
    description:
      'Funding a solar-powered water pump to serve 200 families with clean water year-round.',
    goal: '15000',
    deadline: '2026-03-31',
    category: 'Tech',
  });

  const categories = ['Education', 'Environment', 'Tech', 'Art', 'Community'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Demonstrate mapping to Soroban payload
    const contractPayload = {
      name: formData.name,
      description: formData.description,
      goal: Number(formData.goal),
      deadline: Math.floor(new Date(formData.deadline).getTime() / 1000), // Unix timestamp for u64
    };

    toast.success('Campaign Created Successfully', {
      description: `Name: ${contractPayload.name}\nGoal: ${contractPayload.goal} XLM`,
      action: {
        label: 'View Transaction',
        onClick: () => console.log(contractPayload),
      },
      duration: 5000,
    });
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
              <rect
                x="20"
                y="40"
                width="120"
                height="22"
                rx="11"
                fill="#00c9a7"
                opacity="0.5"
              />
              <rect
                x="160"
                y="28"
                width="80"
                height="22"
                rx="11"
                fill="#4f7bff"
                opacity="0.4"
              />
              <circle cx="258" cy="50" r="20" fill="#e85d26" opacity="0.3" />
              <rect
                x="290"
                y="40"
                width="100"
                height="22"
                rx="11"
                fill="#fbbf24"
                opacity="0.4"
              />
              <circle cx="410" cy="39" r="15" fill="#00c9a7" opacity="0.35" />
              <rect
                x="435"
                y="50"
                width="90"
                height="18"
                rx="9"
                fill="#4f7bff"
                opacity="0.3"
              />
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
                    className={cn(
                      'px-5 py-5 rounded-full text-[0.82rem] font-medium border transition-all hover:bg-transparent',
                      formData.category === cat
                        ? 'bg-[rgba(0,201,167,0.07)] border-[var(--teal)] text-[var(--teal)] hover:text-[var(--teal)]'
                        : 'bg-[var(--surface)] border-[var(--border2)] text-[var(--muted-custom)] hover:border-[var(--teal)] hover:text-[var(--text)]',
                    )}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-7 h-auto rounded-full bg-[var(--text)] text-[var(--bg)] font-bold text-[1rem] shadow-xl shadow-black/20 hover:-translate-y-1 hover:shadow-2xl hover:bg-[var(--text)] transition-all mt-4"
            >
              Create Campaign
            </Button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
