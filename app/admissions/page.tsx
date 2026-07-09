import { PageSection, SiteShell } from "@/components/site-shell";
import { AdmissionsForm } from "@/components/admissions-form";

export default function AdmissionsPage() {
  return (
    <SiteShell>
      <PageSection eyebrow="Enrollment" title="Admissions Form">
        <AdmissionsForm />
      </PageSection>
    </SiteShell>
  );
}
