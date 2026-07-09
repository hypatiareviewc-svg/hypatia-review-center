"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { stats } from "@/lib/site-content";

function AnimatedCount({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const visible = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(value / 42));
    const timer = window.setInterval(() => {
      current = Math.min(value, current + step);
      setCount(current);
      if (current >= value) {
        window.clearInterval(timer);
      }
    }, 22);
    return () => window.clearInterval(timer);
  }, [value, visible]);

  return (
    <span ref={ref} className="font-display text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsStrip() {
  return (
    <section className="py-6 sm:py-8">
      <div className="container-shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.45 }}
          className="surface-card grid gap-4 rounded-[2rem] p-6 sm:grid-cols-2 lg:grid-cols-5"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[1.5rem] bg-[var(--surface-soft)] p-5 text-center">
              <AnimatedCount value={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm font-medium text-[var(--muted)]">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}