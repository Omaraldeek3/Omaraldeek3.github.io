/** A small drawing for each lab card's plate, one per work, animated in CSS
 *  only. Decorative: the card's title and text carry everything it says. */
export function LabArt({ slug }: { slug: string }) {
  switch (slug) {
    case "ai-automation":
      return (
        <svg className="lab-art art-auto" viewBox="0 0 160 120" aria-hidden="true">
          <g className="art-orbit">
            <circle cx="80" cy="60" r="44" className="art-ring" />
            <circle cx="124" cy="60" r="4" className="art-node" />
            <circle cx="36" cy="60" r="3" className="art-node dim" />
            <circle cx="80" cy="16" r="3" className="art-node dim" />
          </g>
          <g className="art-gear">
            <path
              className="art-stroke"
              d="M80 38l4 0 2 6 5 2 6-3 3 3-3 6 2 5 6 2v4l-6 2-2 5 3 6-3 3-6-3-5 2-2 6h-4l-2-6-5-2-6 3-3-3 3-6-2-5-6-2v-4l6-2 2-5-3-6 3-3 6 3 5-2z"
            />
            <circle cx="82" cy="60" r="7" className="art-stroke" />
          </g>
        </svg>
      );
    case "cut-studio":
      return (
        <svg className="lab-art art-cut" viewBox="0 0 160 120" aria-hidden="true">
          <rect x="30" y="22" width="100" height="76" rx="4" className="art-sheet" />
          <path className="art-cutline" d="M48 44h26v32H48zM86 40c14 0 24 8 24 20s-10 20-24 20" pathLength="100" />
          <line className="art-beam" x1="30" y1="22" x2="30" y2="98" />
        </svg>
      );
    case "design-studies":
      return (
        <svg className="lab-art art-design" viewBox="0 0 160 120" aria-hidden="true">
          <rect className="art-card c1" x="50" y="26" width="60" height="72" rx="6" />
          <rect className="art-card c2" x="50" y="26" width="60" height="72" rx="6" />
          <rect className="art-card c3" x="50" y="26" width="60" height="72" rx="6" />
          <path className="art-diamond" d="M80 48l12 12-12 12-12-12z" />
        </svg>
      );
    case "saas-panel":
      return (
        <svg className="lab-art art-saas" viewBox="0 0 160 120" aria-hidden="true">
          <rect x="30" y="24" width="100" height="72" rx="6" className="art-sheet" />
          <line x1="30" y1="38" x2="130" y2="38" className="art-rule" />
          <rect className="art-bar b1" x="44" y="54" width="12" height="32" rx="2" />
          <rect className="art-bar b2" x="62" y="54" width="12" height="32" rx="2" />
          <rect className="art-bar b3" x="80" y="54" width="12" height="32" rx="2" />
          <rect className="art-bar b4" x="98" y="54" width="12" height="32" rx="2" />
          <circle cx="38" cy="31" r="2" className="art-node" />
        </svg>
      );
    default:
      return null;
  }
}
