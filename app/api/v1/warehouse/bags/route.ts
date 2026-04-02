import { NextResponse } from "next/server";
import { readFirstTable, txt } from "@/lib/server-ops";

const CANDIDATES = ["warehouse_bags", "bags"];

export async function GET() {
  try {
    const { rows } = await readFirstTable(CANDIDATES, 500);

    const items = rows.map((row, index) => ({
      id: txt(row.id) || `bag-${index + 1}`,
      code: txt(row.bag_no, row.code) || `BAG-${index + 1}`,
      status: txt(row.status) || "open",
      branch_name: txt(row.branch_name, row.location, row.branch_id),
      created_at: txt(row.created_at, row.updated_at),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        title: "Warehouse bags unavailable",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
