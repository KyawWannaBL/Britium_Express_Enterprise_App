import type { Session } from "next-auth";
import { setApiBearerToken } from "@/lib/api";
export function bindSessionToApi(session: Session | null) {
  setApiBearerToken(session?.accessToken);
}
