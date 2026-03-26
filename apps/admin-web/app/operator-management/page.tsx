import { Shell, SectionTitle } from "../_components/ui";
import OperatorManagementConsole from "./OperatorManagementConsole";

export default function OperatorManagementPage() {
  return (
    <Shell activeHref="/operator-management">
      <section className="hero">
        <article className="hero-card">
          <div className="kicker">Super admin control</div>
          <h1 className="hero-title">Operator onboarding, branch access, and security controls.</h1>
          <p className="hero-copy" style={{ marginTop: 16, maxWidth: 760 }}>
            Create staff users, assign branch scope, force password reset, suspend access, and
            manage roles from one branded control surface for Britium Express Delivery.
          </p>
        </article>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <SectionTitle
          eyebrow="Identity operations"
          title="Operator Management"
          copy="This screen is wired for Supabase Auth, branch-scoped RBAC, must-change-password enforcement, and enterprise-grade operational governance."
        />
        <OperatorManagementConsole />
      </section>
    </Shell>
  );
}