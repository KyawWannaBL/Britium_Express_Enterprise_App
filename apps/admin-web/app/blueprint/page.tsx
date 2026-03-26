
import Link from "next/link";
import { Shell } from "../../components/Shell";
import { sections } from "../../lib/data";

export default function BlueprintIndexPage() {
  return (
    <Shell
      title="Editable blueprint rebuilt from the attached PDF"
      subtitle="This area converts the uploaded BE pages into contractor-friendly editable screens. Each section maps visual reference pages into typed React forms, tables, and workflows that fit the Britium architecture."
    >
      <div className="grid cards">
        {sections.map((section) => (
          <article className="card" key={section.slug}>
            <div className="badge">{section.referencePages.length} mapped pages</div>
            <h3 style={{ marginTop: 12 }}>{section.title}</h3>
            <p className="muted" style={{ minHeight: 66 }}>{section.description}</p>
            <p className="muted"><strong>Myanmar:</strong> {section.titleMy}</p>
            <div className="chipWrap" style={{ marginBottom: 16 }}>
              {section.tags.map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
            <Link className="navlink" href={`/blueprint/${section.slug}`}>
              Open editable module
            </Link>
          </article>
        ))}
      </div>
    </Shell>
  );
}
