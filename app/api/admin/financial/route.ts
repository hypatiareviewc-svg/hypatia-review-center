import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-session";
import { getFinancialReport } from "@/lib/financial-stats";

/** GET /api/admin/financial — full financial report (admin only). */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await getFinancialReport();
    return NextResponse.json(report);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("Financial report error:", detail);
    return NextResponse.json({ message: `Server error: ${detail}` }, { status: 500 });
  }
}
