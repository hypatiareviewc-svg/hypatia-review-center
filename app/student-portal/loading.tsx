"use client";

import { motion } from "framer-motion";
import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { CARD_COUNT, SkeletonCard } from "@/components/student-skeleton-grid";

export default function StudentPortalLoading() {
  return (
    <SiteShell>
      <PageHero
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/student-portal", label: "Student Portal" },
        ]}
      />
      <PageSection
        title="Students who have enrolled at Hypatia"
        description="Browse through our enrolled students and get to know the future professionals of their respective fields."
      >
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="status"
          aria-label="Loading students"
        >
          {Array.from({ length: CARD_COUNT }, (_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
          <span className="sr-only">Loading student profiles…</span>
        </motion.div>
      </PageSection>
    </SiteShell>
  );
}
