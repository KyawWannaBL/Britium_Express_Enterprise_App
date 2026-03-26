import { redirect } from "next/navigation";

export default function OpsAccessPage() {
  redirect("/auth/sign-in");
}
