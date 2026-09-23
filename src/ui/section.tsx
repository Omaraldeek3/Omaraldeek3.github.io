/** A section header in the site's one shape: an amber rule and label, the
 *  section's number, then the title. `title` may carry a `|` to mark the
 *  phrase that takes the gradient, the way the hero's last line does. */
export function Section({
  id,
  index,
  label,
  title,
  intro,
  children,
}: {
  id: string;
  index: string;
  label: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  const [plain, accent] = splitTitle(title);
  return (
    <section id={id} className="section">
      <div className="shell">
        <div className="section-head">
          <p className="section-label">{label}</p>
          <p className="section-index mono" dir="ltr" aria-hidden="true">
            {index}
          </p>
        </div>
        <h2 className="section-title">
          {plain}
          {accent && <em>{accent}</em>}
        </h2>
        {intro && <p className="section-intro">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

/** Splits on the first newline so the second sentence takes the gradient.
 *  A title without one simply stays plain. */
function splitTitle(title: string): [string, string | null] {
  const cut = title.indexOf("\n");
  if (cut === -1) return [title, null];
  return [`${title.slice(0, cut)}\n`, title.slice(cut + 1)];
}
