import { PageHero } from "@/components/page-hero";
import { PageSection, SiteShell } from "@/components/site-shell";
import { StudentGrid } from "@/components/student-grid";
import type { EnrollmentRecord } from "@/lib/enrollment-display";
import { prisma } from "@/lib/prisma";

function serializeEnrollment(record: Awaited<ReturnType<typeof prisma.enrollmentApplication.findMany>>[number]): EnrollmentRecord {
  return {
    id: record.id,
    applicationNumber: record.applicationNumber,
    photoName: record.photoName,
    photoUrl: record.photoUrl,
    lastName: record.lastName,
    firstName: record.firstName,
    middleName: record.middleName,
    street: record.street,
    barangay: record.barangay,
    cityMunicipality: record.cityMunicipality,
    province: record.province,
    zipcode: record.zipcode,
    email: record.email,
    contactNumber: record.contactNumber,
    schoolName: record.schoolName,
    schoolAddress: record.schoolAddress,
    yearGraduated: record.yearGraduated,
    programCourse: record.programCourse,
    guardianFullName: record.guardianFullName,
    guardianAddress: record.guardianAddress,
    guardianContactNumber: record.guardianContactNumber,
    status: record.status,
    submittedAt: record.submittedAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export default async function StudentPortalPage() {
  const enrollments = await prisma.enrollmentApplication.findMany({
    orderBy: { submittedAt: "desc" },
  });

  const records = enrollments.map(serializeEnrollment);

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
        <StudentGrid students={records} />
      </PageSection>
    </SiteShell>
  );
}
