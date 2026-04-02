import { NextResponse } from "next/server";
import { readFirstTable, txt, num } from "@/lib/server-ops";

const CANDIDATES = ["rider_cod_collections", "cod_collections", "rider_collections"];

export async function GET() {
  try {
    const { rows } = await readFirstTable(CANDIDATES, 1000);

    const items = rows.map((row, index) => ({
      id: txt(row.id) || `cod-${index + 1}`,
      amount: num(row.amount, row.cod_amount, row.collected_amount),
      status: txt(row.status) || "submitted",
      created_at: txt(row.created_at, row.updated_at),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        title: "Rider COD collections unavailable",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
