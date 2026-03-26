
import Image from "next/image";
import { Shell } from "../../components/Shell";

const pages = Array.from({ length: 88 }, (_, index) => {
  const number = String(index + 1).padStart(3, "0");
  return {
    number,
    src: `/reference-pages/page-${number}.jpg`
  };
});

export default function ReferencePage() {
  return (
    <Shell
      title="Attached PDF gallery"
      subtitle="All pages from the uploaded BE reference PDF are preserved here. Each image is linked by page number so the editable blueprint modules can point back to the original visual source."
    >
      <div className="gallery">
        {pages.map((page) => (
          <article className="card" id={`page-${page.number}`} key={page.number}>
            <div className="badge">PDF page {page.number}</div>
            <div style={{ marginTop: 12 }}>
              <Image
                src={page.src}
                alt={`Reference page ${page.number}`}
                width={900}
                height={1300}
                style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid #d9e1ec" }}
              />
            </div>
          </article>
        ))}
      </div>
    </Shell>
  );
}
