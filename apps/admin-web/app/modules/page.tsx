
import Link from "next/link";
import { Shell } from "../../components/Shell";
import { sections } from "../../lib/data";

export default function ModulesPage() {
  return (
    <Shell
      title="Combined modules from the BE reference + new architecture"
      subtitle="The uploaded PDF points to an operations-heavy logistics console. These grouped modules translate that visual structure into implementation-ready sections backed by Supabase tables and Vercel-hosted Next.js screens."
    >
      <div className="grid cards">
        {sections.map((section) => (
          <article className="card" key={section.slug}>
            <h3>{section.title}</h3>
            <p className="muted">{section.description}</p>
            <p className="muted"><strong>Mapped pages:</strong> {section.referencePages.join(", ")}</p>
            <Link className="navlink" href={`/blueprint/${section.slug}`}>
              Open editable rebuild
            </Link>
          </article>
        ))}
      </div>
    </Shell>
  );
}
