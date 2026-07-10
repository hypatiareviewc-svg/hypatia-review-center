"use client";

import { motion } from "framer-motion";

export const SKELETON_ROWS = 8;

function Pulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ opacity: [0.35, 0.65, 0.35] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function EnrollmentSkeleton() {
  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      {/* Table skeleton */}
      <div className="divide-y divide-[var(--border)]">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div key={i} className="grid grid-cols-[2.5rem_1fr_1fr_1fr_6rem_5rem] items-center gap-4 px-4 py-3.5 sm:px-6">
            {/* Photo */}
            <Pulse className="h-9 w-9 rounded-full bg-[var(--surface-strong)]" />
            {/* Name */}
            <Pulse className="h-4 w-28 rounded bg-[var(--surface-strong)]" />
            {/* Program */}
            <Pulse className="hidden h-4 w-32 rounded bg-[var(--surface-strong)] sm:block" />
            {/* School */}
            <Pulse className="hidden h-4 w-24 rounded bg-[var(--surface-strong)] lg:block" />
            {/* Status */}
            <Pulse className="h-6 w-20 rounded-full bg-[var(--surface-strong)]" />
            {/* Actions */}
            <Pulse className="h-8 w-16 rounded-lg bg-[var(--surface-strong)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
