/** The tools the lab is actually built with, running past as a ribbon. The
 *  list is written twice so the loop has no seam; the copy is hidden from
 *  assistive tech, which reads the list once. */
const tools = [
  "Next.js", "React", "TypeScript", "n8n", "Python", "Docker", "ElevenLabs",
  "Gemini", "FLUX", "Veo", "ffmpeg", "Playwright", "YouTube API", "Telegram",
  "Google Sheets", "SVG", "DXF", "RDWorks", "CorelDRAW", "Web Workers",
];

export function Ribbon({ label }: { label: string }) {
  return (
    <div className="ribbon" dir="ltr">
      <ul className="ribbon-track" aria-label={label}>
        {tools.map(tool => (
          <li key={tool}>{tool}</li>
        ))}
      </ul>
      <ul className="ribbon-track" aria-hidden="true">
        {tools.map(tool => (
          <li key={tool}>{tool}</li>
        ))}
      </ul>
    </div>
  );
}
