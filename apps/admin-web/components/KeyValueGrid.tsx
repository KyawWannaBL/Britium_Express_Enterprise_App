
export function KeyValueGrid({
  items
}: {
  items: Array<{ label: string; value: string; note?: string }>;
}) {
  return (
    <div className="grid cards">
      {items.map((item) => (
        <article className="card" key={item.label}>
          <div className="muted">{item.label}</div>
          <div className="stat" style={{ fontSize: 22 }}>{item.value}</div>
          {item.note ? <div className="muted">{item.note}</div> : null}
        </article>
      ))}
    </div>
  );
}
