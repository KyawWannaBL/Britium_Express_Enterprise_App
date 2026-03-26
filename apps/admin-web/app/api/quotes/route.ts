
import { NextRequest, NextResponse } from "next/server";
import { requireOpsAccess } from "../../../lib/api-guard";
import { estimateCreateDeliveryQuote } from "../../../lib/create-delivery";

export async function POST(request: NextRequest) {
  const access = await requireOpsAccess(request);
  if (access instanceof NextResponse) {
    return access;
  }

  const body = await request.json();

  try {
    const quote = estimateCreateDeliveryQuote(body);
    return NextResponse.json({
      ok: true,
      operator: access.profileId,
      quote
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to calculate quote" },
      { status: 400 }
    );
  }
}
