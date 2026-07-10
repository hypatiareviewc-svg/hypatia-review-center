"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { StudentGrid } from "@/components/student-grid";
import { CARD_COUNT, SkeletonCard } from "@/components/student-skeleton-grid";
import type { EnrollmentRecord } from "@/lib/enrollment-display";

export default function StudentPortalPage() {
  const [records, setRecords] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admissions/applications")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load enrollments");
        return res.json();
      })
      .then((data) => setRecords(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
        <AnimatePresence mode="wait">
          {loading && !error && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              role="status"
              aria-label="Loading students"
            >
              {Array.from({ length: CARD_COUNT }, (_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
              <span className="sr-only">Loading student profiles…</span>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="text-center text-destructive py-12">{error}</p>
        )}
        {!loading && !error && <StudentGrid students={records} />}
      </PageSection>
    </SiteShell>
  );
}
