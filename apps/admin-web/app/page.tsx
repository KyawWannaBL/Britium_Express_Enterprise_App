import { redirect } from "next/navigation";

export default function RootPage() {
  // Direct entry to the Auth Gateway
  redirect("/auth/sign-in");
}
