export function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="section">
      <div className="shell">
        <p className="section-label">{label}</p>
        <h2 className="section-title">{title}</h2>
        {children}
      </div>
    </section>
  );
}
