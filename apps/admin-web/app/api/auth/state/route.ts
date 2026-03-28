import { NextRequest, NextResponse } from "next/server";
import { getOpsIdentity } from "@/lib/api-guard";

// 🚨 CRITICAL FIX: Force Next.js to skip the cache and evaluate this route fresh every single time.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const identity = await getOpsIdentity(request);

    if (!identity) {
      return NextResponse.json(
        { authenticated: false, error: "Not signed in" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      authUserId: identity.authUserId,
      profileId: identity.profileId,
      role: identity.role,
      appRole: identity.appRole,
      fullName: identity.fullName,
      branchCode: identity.branchCode,
      mustChangePassword: identity.mustChangePassword
    });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : "Failed to resolve auth state"
      },
      { status: 500 }
    );
  }
}