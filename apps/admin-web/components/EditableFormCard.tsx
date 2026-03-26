
export function EditableFormCard({
  title,
  description,
  fields
}: {
  title: string;
  description: string;
  fields: Array<{ label: string; placeholder: string; value?: string }>;
}) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      <div className="formGrid">
        {fields.map((field) => (
          <label key={field.label} className="field">
            <span>{field.label}</span>
            <input defaultValue={field.value} placeholder={field.placeholder} />
          </label>
        ))}
      </div>
    </div>
  );
}
