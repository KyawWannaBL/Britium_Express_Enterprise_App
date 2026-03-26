
export function SectionHeader({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h3 className="sectionTitle" style={{ marginTop: 6, marginBottom: 8 }}>{title}</h3>
      <p className="muted" style={{ marginTop: 0, maxWidth: 940 }}>{subtitle}</p>
    </div>
  );
}
