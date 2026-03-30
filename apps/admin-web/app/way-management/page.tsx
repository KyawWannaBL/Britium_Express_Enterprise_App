import { createClient } from "@/lib/supabase/server";
import WayManagementConsole from "./WayManagementConsole";
import { redirect } from "next/navigation";

export default async function WayManagementPage() {
  // 1. Await the client creation
  const supabase = await createClient();

  // 2. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  // 3. Render the correct console
  return <WayManagementConsole />;
}