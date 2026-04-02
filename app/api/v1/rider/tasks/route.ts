import { NextResponse } from "next/server";
import { readFirstTable, txt, num } from "@/lib/server-ops";

const CANDIDATES = ["delivery_tasks", "rider_tasks", "tasks"];

export async function GET() {
  try {
    const { rows } = await readFirstTable(CANDIDATES, 1000);

    const items = rows.map((row, index) => ({
      id: txt(row.id) || `task-${index + 1}`,
      tracking_no: txt(row.tracking_no, row.shipment_tracking_no, row.code) || `TASK-${index + 1}`,
      customer_name: txt(row.customer_name, row.recipient_name, row.receiver_name),
      status: txt(row.status) || "assigned",
      area: txt(row.area, row.township, row.branch_name),
      cod_amount: num(row.cod_amount, row.collectable_amount, row.total_collectable),
      updated_at: txt(row.updated_at, row.created_at),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        title: "Rider tasks unavailable",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
