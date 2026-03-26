import { Suspense } from "react";
import MustChangePasswordClient from "./MustChangePasswordClient";

export default function MustChangePasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading password change...</div>}>
      <MustChangePasswordClient />
    </Suspense>
  );
}
