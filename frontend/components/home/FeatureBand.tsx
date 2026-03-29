"use client";

import { Zap, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function FeatureBand() {
  const features = [
    {
      icon: <Zap className="text-[var(--teal)] w-6 h-6" />,
      title: "Real-time events",
      description: "Every contribution updates campaign progress instantly. Watch your project grow in real-time.",
    },
    {
      icon: <Shield className="text-[var(--teal)] w-6 h-6" />,
      title: "Non-custodial",
      description: "You are in control. Funds move directly from backers to creators securely, without any middlemen overhead.",
    },
    {
      icon: <Globe className="text-[var(--teal)] w-6 h-6" />,
      title: "Borderless",
      description: "Anyone with a Stellar wallet can fund any campaign. No borders, no banks, no permission needed.",
    },
  ];

  return (
    <section className="bg-[var(--dark-section)] py-12 sm:py-16 px-4 sm:px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-0 relative overflow-hidden dark-band-grid">
      {features.map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="relative z-10 p-6 sm:p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/15 dark:border-black/15 last:border-0 md:last:border-r-0"
        >
          <div className="mb-4">{feature.icon}</div>
          <h3 className="font-sans text-base sm:text-lg font-semibold text-[var(--dark-text)] mb-2">
            {feature.title}
          </h3>
          <p className="text-[0.82rem] leading-relaxed font-light text-[var(--dark-text)] opacity-60">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </section>
  );
}
