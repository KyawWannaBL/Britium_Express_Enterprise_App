import { createClient } from "@/lib/supabase/server";
import { CreateDeliveryConsole } from "./CreateDeliveryConsole";
import { redirect } from "next/navigation";

export default async function CreateDeliveryPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  return <CreateDeliveryConsole initialData={{ mode: "live" }} />;
}