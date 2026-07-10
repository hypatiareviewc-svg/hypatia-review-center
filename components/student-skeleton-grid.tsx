"use client";

import { motion } from "framer-motion";

export const CARD_COUNT = 8;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="surface-card overflow-hidden rounded-[1.75rem]"
    >
      {/* Photo placeholder */}
      <div className="relative aspect-[4/5] w-full bg-[var(--surface)] sm:aspect-[3/4]">
        <SkeletonPulse className="absolute inset-0 bg-[linear-gradient(160deg,color-mix(in_srgb,var(--primary)_88%,#000),color-mix(in_srgb,var(--primary)_62%,var(--secondary)))] opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <SkeletonPulse className="h-16 w-16 rounded-full border border-white/20 bg-white/10" />
        </div>
        {/* Badge skeleton */}
        <SkeletonPulse className="absolute right-3 top-3 h-6 w-20 rounded-full bg-white/15" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        <SkeletonPulse className="h-2 w-20 rounded bg-[var(--surface)]" />

        <div className="space-y-2">
          <SkeletonPulse className="h-5 w-36 rounded bg-[var(--surface)]" />
          <SkeletonPulse className="h-5 w-28 rounded bg-[var(--surface)]" />
        </div>

        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <SkeletonPulse className="h-2 w-24 rounded bg-[var(--surface)]" />
            <SkeletonPulse className="h-4 w-full rounded bg-[var(--surface)]" />
          </div>
          <div className="space-y-1.5">
            <SkeletonPulse className="h-2 w-24 rounded bg-[var(--surface)]" />
            <SkeletonPulse className="h-4 w-3/4 rounded bg-[var(--surface)]" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
