export type AttendanceSession = {
  id: string;
  title: string;
  description: string | null;
  sessionDate: string; // ISO
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { records: number };
};

export type AttendanceRecord = {
  id: string;
  sessionId: string;
  enrollmentId: string;
  applicationNumber: string;
  studentName: string;
  programCourse: string;
  photoUrl: string | null;
  scannedAt: string; // ISO
};

export type StudentScanResult = {
  enrollmentId: string;
  applicationNumber: string;
  studentName: string;
  programCourse: string;
  photoUrl: string | null;
  status: string;
  /** null = not yet marked, otherwise the scannedAt ISO string */
  alreadyRecorded: string | null;
};
