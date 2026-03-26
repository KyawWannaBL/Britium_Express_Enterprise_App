import { Suspense } from "react";
import SignInClient from "./SignInClient";

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading sign-in...</div>}>
      <SignInClient />
    </Suspense>
  );
}
