
import Link from "next/link";

const links = [
  { href: "/", label: "Executive dashboard" },
  { href: "/blueprint", label: "Editable PDF blueprint" },
  { href: "/waybill-printing", label: "Waybill + QR flow" },
  { href: "/financial-center", label: "Financial center" },
  { href: "/modules", label: "Combined modules" },
  { href: "/reference", label: "Attached PDF gallery" }
];

export function Shell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>Britium Express Delivery</h1>
        <p style={{ color: "#c7d2fe", lineHeight: 1.5 }}>
          Vercel + Supabase starter aligned to the uploaded BE page reference.
        </p>
        <nav>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="navlink">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="content">
        <div className="hero">
          <h2 style={{ marginTop: 0 }}>{title}</h2>
          <p style={{ opacity: 0.92, maxWidth: 920 }}>{subtitle}</p>
        </div>
        {children}
      </section>
    </div>
  );
}
