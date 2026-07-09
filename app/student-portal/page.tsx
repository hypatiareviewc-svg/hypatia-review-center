"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { StudentGrid } from "@/components/student-grid";
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
        title="Student Portal"
        description="View enrolled students with profile cards styled for quick reference."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/student-portal", label: "Student Portal" },
        ]}
      />
      <PageSection
        eyebrow="Student Profiles"
        title="Enrolled students from the admissions records."
        description="Each card shows the student photo, name, course or program, and school graduated, with an enrollment badge on the profile photo."
      >
        {loading && (
          <p className="text-center text-muted-foreground py-12">Loading students&hellip;</p>
        )}
        {error && (
          <p className="text-center text-destructive py-12">{error}</p>
        )}
        {!loading && !error && <StudentGrid students={records} />}
      </PageSection>
    </SiteShell>
  );
}
