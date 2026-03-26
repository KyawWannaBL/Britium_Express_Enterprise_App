
import Link from "next/link";

export function ReferenceStrip({
  pages
}: {
  pages: number[];
}) {
  return (
    <div className="card">
      <h3>Mapped attached pages</h3>
      <p className="muted">
        These page numbers from the uploaded PDF were visually grouped into this editable module.
      </p>
      <div className="chipWrap">
        {pages.map((page) => (
          <Link key={page} className="chip" href={`/reference#page-${String(page).padStart(3, "0")}`}>
            PDF page {page}
          </Link>
        ))}
      </div>
    </div>
  );
}
