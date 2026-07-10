/**
 * Standalone layout for the attendance scanner.
 * No admin shell or sidebar — just a full-viewport dark container.
 */
export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div style={{ minHeight: "100vh", background: "#0a0e1a" }}>{children}</div>;
}
