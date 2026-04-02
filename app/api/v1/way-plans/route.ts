import { NextRequest, NextResponse } from "next/server";
import { insertFirstTable, insertManyFirstTable, readFirstTable, txt } from "@/lib/server-ops";

const PLAN_TABLES = ["way_plans"];
const STOP_TABLES = ["way_plan_stops"];

export async function GET() {
  try {
    const { rows } = await readFirstTable(PLAN_TABLES, 200);
    return NextResponse.json({ items: rows });
  } catch (error) {
    return NextResponse.json(
      {
        title: "Way plans unavailable",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stops = Array.isArray(body?.stops) ? body.stops : [];

    const { row: plan } = await insertFirstTable(PLAN_TABLES, {
      plan_name: txt(body?.plan_name) || "Daily Way Plan",
      plan_date: txt(body?.plan_date),
      route_mode: txt(body?.route_mode) || "closed_loop",
      group_count: Array.isArray(body?.groups) ? body.groups.length : 0,
      created_at: new Date().toISOString(),
    });

    if (stops.length) {
      await insertManyFirstTable(
        STOP_TABLES,
        stops.map((stop: Record<string, unknown>) => ({
          way_plan_id: plan.id,
          way_id: txt(stop.way_id),
          recipient_name: txt(stop.recipient_name),
          township: txt(stop.township),
          address: txt(stop.address),
          phone_1: txt(stop.phone_1),
          phone_2: txt(stop.phone_2),
          payment_type: txt(stop.payment_type),
          weight_kg: stop.weight_kg ?? 0,
          item_price: stop.item_price ?? 0,
          delivery_charge: stop.delivery_charge ?? 0,
          weight_charge: stop.weight_charge ?? 0,
          total: stop.total ?? 0,
          rider_name: txt(stop.rider_name),
          driver_name: txt(stop.driver_name),
          helper_name: txt(stop.helper_name),
          car_no: txt(stop.car_no),
          remark: txt(stop.remark),
          latitude: stop.latitude ?? null,
          longitude: stop.longitude ?? null,
          route_group: txt(stop.route_group),
          sequence_no: stop.sequence_no ?? 0,
          created_at: new Date().toISOString(),
        }))
      );
    }

    return NextResponse.json({ id: plan.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        title: "Way plan save failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
