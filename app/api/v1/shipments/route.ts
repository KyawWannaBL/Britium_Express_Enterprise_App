import { NextRequest, NextResponse } from "next/server";
import { readFirstTable, txt, num } from "@/lib/server-ops";

const CANDIDATES = ["shipments", "orders", "deliveries"];

export async function GET(req: NextRequest) {
  try {
    const { rows } = await readFirstTable(CANDIDATES, 1000);
    const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim() || "";
    const status = req.nextUrl.searchParams.get("status")?.toLowerCase().trim() || "";

    let items = rows.map((row, index) => ({
      id: txt(row.id) || `shipment-${index + 1}`,
      tracking_no: txt(row.tracking_no, row.waybill_no, row.reference_no) || `WB-${index + 1}`,
      customer_name: txt(row.customer_name, row.recipient_name, row.receiver_name, row.sender_name),
      recipient_phone: txt(row.recipient_phone, row.phone, row.customer_phone),
      current_status: txt(row.current_status, row.status) || "processing",
      total_collectable: num(row.total_collectable, row.cod_amount, row.total, row.total_charge),
      last_location: txt(row.last_location, row.current_branch, row.address, row.township),
      rider_remark: txt(row.rider_remark, row.remark, row.comments),
      created_at: txt(row.created_at, row.booked_at, row.updated_at),
    }));

    if (q) {
      items = items.filter((row) =>
        [
          row.tracking_no,
          row.customer_name,
          row.recipient_phone,
          row.last_location,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (status) {
      items = items.filter((row) => row.current_status.toLowerCase() === status);
    }

    return NextResponse.json({ items, total_count: items.length });
  } catch (error) {
    return NextResponse.json(
      {
        title: "Shipment listing unavailable",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
