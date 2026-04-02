import { NextResponse } from "next/server";
import { readFirstTable, txt } from "@/lib/server-ops";

const CANDIDATES = ["warehouse_scans", "scans"];

export async function GET() {
  try {
    const { rows } = await readFirstTable(CANDIDATES, 500);

    const items = rows.map((row, index) => ({
      id: txt(row.id) || `scan-${index + 1}`,
      code: txt(row.code, row.tracking_no, row.scan_code) || `SCAN-${index + 1}`,
      status: txt(row.status) || "pending",
      branch_name: txt(row.branch_name, row.location, row.branch_id),
      created_at: txt(row.created_at, row.updated_at),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        title: "Warehouse scans unavailable",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
