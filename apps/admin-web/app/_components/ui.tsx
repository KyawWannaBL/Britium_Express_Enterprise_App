import Link from "next/link";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
};

export function TopBar({ activeHref }: { activeHref: string }) {
  const items: NavItem[] = [
    { href: "/", label: "Control Tower" },
    { href: "/create-delivery", label: "Create Delivery" },
    { href: "/way-management", label: "Way Management" },
    { href: "/financial-reports", label: "Financial Reports" },
    { href: "/operator-management", label: "Operator Management" }
  ];

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" />
        <div>
          <div className="brand-title">Britium Express Delivery</div>
          <div className="brand-subtitle">Myanmar / English logistics operations suite</div>
        </div>
      </div>
      <nav className="nav" aria-label="Primary">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${item.href === activeHref ? " active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Shell({
  activeHref,
  children
}: {
  activeHref: string;
  children: ReactNode;
}) {
  return (
    <>
      <TopBar activeHref={activeHref} />
      <div className="shell">{children}</div>
    </>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  copy,
  action
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <div className="kicker">{eyebrow}</div>
        <h2 style={{ marginTop: 10, fontSize: "1.7rem" }}>{title}</h2>
        <p className="muted" style={{ marginTop: 10, maxWidth: 760 }}>
          {copy}
        </p>
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  meta
}: {
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <article className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-meta">{meta}</div>
    </article>
  );
}

export function DualLine({
  en,
  my
}: {
  en: string;
  my: string;
}) {
  return (
    <div className="dual-line">
      <strong>{en}</strong>
      <span>{my}</span>
    </div>
  );
}

export function StatusPill({
  tone,
  children
}: {
  tone: "success" | "warning" | "danger" | "info" | "pending";
  children: ReactNode;
}) {
  return <span className={`status ${tone}`}>{children}</span>;
}

export function HeroActions() {
  return (
    <div className="action-row">
      <button className="btn btn-primary">Launch workflow</button>
      <button className="btn btn-secondary">Export board</button>
      <span className="badge">Vercel + Supabase ready</span>
    </div>
  );
}
