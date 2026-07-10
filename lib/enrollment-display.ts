export type EnrollmentStatus = "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";

export type EnrollmentRecord = {
  id: string;
  applicationNumber: string;
  photoName: string | null;
  photoUrl: string | null;
  lastName: string;
  firstName: string;
  middleName: string;
  sex: string | null;
  birthday: string | null;
  birthPlace: string | null;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  zipcode: string;
  email: string;
  contactNumber: string;
  schoolName: string;
  schoolAddress: string;
  yearGraduated: string;
  programCourse: string;
  guardianFullName: string;
  guardianAddress: string;
  guardianContactNumber: string;
  status: EnrollmentStatus;
  tuitionFee: string | null;
  amountPaid: string | null;
  submittedAt: string;
  updatedAt: string;
};

export function formatStudentName(record: Pick<EnrollmentRecord, "lastName" | "firstName" | "middleName">) {
  return [record.lastName, record.firstName, record.middleName].filter(Boolean).join(", ");
}

export function formatStudentAddress(record: Pick<EnrollmentRecord, "street" | "barangay" | "cityMunicipality" | "province" | "zipcode">) {
  return `${record.street}, ${record.barangay}, ${record.cityMunicipality}, ${record.province} ${record.zipcode}`;
}

export function formatEnrollmentDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

export const enrollmentStatusMeta: Record<
  EnrollmentStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  },
  REVIEWING: {
    label: "Under Review",
    className: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200",
  },
  APPROVED: {
    label: "Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
  },
};
