import { AttendanceDashboard } from "@/components/admin/attendance-dashboard";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[var(--primary)] sm:text-3xl">
          Attendance
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage attendance sessions and track student presence via QR code scanning.
        </p>
      </div>
      <AttendanceDashboard />
    </div>
  );
}
