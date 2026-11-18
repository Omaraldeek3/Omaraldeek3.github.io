import { copy } from "@/content/site";
import type { Locale } from "@/content/locales";
import { Bidi } from "./bidi";

const DESIGN_BARS = [
  { key: "Tabaa", count: 200, ratio: 42 },
  { key: "Cut Studio", count: 29, ratio: 26 },
  { key: "Shakl", count: 302, ratio: 63 },
  { key: "Qalib", count: 324, ratio: 68 },
  { key: "Harf", count: 436, ratio: 91 },
  { key: "Naqsh", count: 480, ratio: 100, highlight: true },
];

const PULSE_BARS = [24, 52, 38, 86, 64, 94, 48, 72, 90, 58, 42, 78];

const DESIGN_PILLS = ["Cut Studio", "Harf", "Naqsh", "Shakl", "Tabaa"];

export function KinReels({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const isAr = locale === "ar";

  return (
    <div className="kin-reels">
      {/* Scene 3: Macro close-up on the morphing 3D laser/geometric assembly */}
      <section className="section kin-reel kin-reel-design" data-scene="craft" aria-labelledby="reel-design-title">
        <div className="shell kin-reel-grid">
          <div className="kin-reel-viewport" aria-hidden="true" />

          <div className="kin-panel">
            <div className="kin-pill-row" aria-hidden="true" dir="ltr">
              {DESIGN_PILLS.map((pill, i) => (
                <span key={pill} className={i === 0 ? "kin-pill is-hot" : "kin-pill"}>
                  {pill}
                </span>
              ))}
            </div>

            <div className="section-head">
              <p className="section-label">
                {isAr ? "الطبقة ٠٢ · التصميم والقص بالليزر" : "LAYER 02 · DESIGN & LASER CAD"}
              </p>
              <p className="section-index mono" dir="ltr" aria-hidden="true">
                01B / 05
              </p>
            </div>

            <h2 id="reel-design-title" className="section-title">
              {isAr ? "أدوات تصميم وتصنيع\n" : "Design & laser tools\n"}
              <em>{isAr ? "تعمل داخل متصفحك." : "running in your browser."}</em>
            </h2>

            <p className="section-intro">
              <Bidi text={t.toolsText} />
            </p>

            <div className="kin-chart-card glow-card">
              <div className="kin-card-head">
                <h3>{isAr ? "مكتبات التصميم المفتوحة" : "Open design libraries"}</h3>
                <span className="kin-tabs mono" dir="ltr" aria-hidden="true">
                  <span>SVG</span>
                  <span className="is-on">WASM</span>
                  <span>DXF</span>
                </span>
              </div>

              <div className="kin-bars" aria-hidden="true">
                {DESIGN_BARS.map(bar => (
                  <div key={bar.key} className="kin-bar-col">
                    <span className="kin-bar-val mono">{bar.count}</span>
                    <div className="kin-bar-track">
                      <div
                        className={bar.highlight ? "kin-bar-fill is-lime" : "kin-bar-fill is-violet"}
                        style={{ blockSize: `${bar.ratio}%` }}
                      />
                    </div>
                    <span className="kin-bar-lbl mono">{bar.key}</span>
                  </div>
                ))}
              </div>

              <p className="kin-card-foot mono">
                {isAr
                  ? "١,٧٧١+ تصميماً وقالباً وخطاً · ٢٩ أداة في Cut Studio"
                  : "1,771+ designs, templates & fonts · 29 tools in Cut Studio"}
              </p>
            </div>

            <div className="kin-progress-card glow-card">
              <div className="kin-card-head">
                <h3>{isAr ? "أين تُعالج ملفاتك؟" : "Where files run"}</h3>
                <span className="kin-badge-lime mono" dir="ltr">
                  100% LOCAL
                </span>
              </div>
              <div className="kin-meter" aria-hidden="true">
                <span className="kin-meter-main is-violet" style={{ inlineSize: "78%" }} />
                <span className="kin-meter-sub" style={{ inlineSize: "22%" }} />
              </div>
              <p className="kin-card-foot">
                {isAr
                  ? "تنفيذ محلي داخل المتصفح (Web Workers / WASM) · بلا حساب وبلا رفع ملفات."
                  : "Executed locally in your browser (Web Workers / WASM) · Zero account, zero uploads."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 4: Macro close-up swinging to the opposite half for AI Automation */}
      <section className="section kin-reel kin-reel-automation" data-scene="fields" aria-labelledby="reel-auto-title">
        <div className="shell kin-reel-grid is-flipped">
          <div className="kin-panel">
            <div className="kin-live-badge" aria-hidden="true">
              <i />
              <span>{t.labLive}</span>
              <span className="mono" dir="ltr">
                · 9 SYSTEMS
              </span>
            </div>

            <div className="section-head">
              <p className="section-label">{t.factoryLabel}</p>
              <p className="section-index mono" dir="ltr" aria-hidden="true">
                01C / 05
              </p>
            </div>

            <h2 id="reel-auto-title" className="section-title">
              {t.factoryTitle}
              {"\n"}
              <em>{t.systemsTitle}</em>
            </h2>

            <p className="section-intro">
              <Bidi text={`${t.factoryIntro} ${t.systemsIntro}`} />
            </p>

            <div className="kin-shortcut-row" aria-hidden="true" dir="ltr">
              {t.stations.map((station, idx) => (
                <span key={station.code} className="kin-shortcut mono">
                  {station.code} <b>⌘{idx + 1}</b>
                </span>
              ))}
            </div>

            <div className="kin-timeline-card glow-card">
              <div className="kin-card-head">
                <h3>{isAr ? "محطات خط الإنتاج اليومي" : "Daily production timeline"}</h3>
                <span className="kin-badge-amber mono" dir="ltr">
                  24/7 VPS
                </span>
              </div>

              <div className="kin-pulse-bars" aria-hidden="true" dir="ltr">
                {PULSE_BARS.map((val, idx) => (
                  <span
                    key={idx}
                    className={idx === 5 || idx === 8 ? "kin-pulse-bar is-hot" : "kin-pulse-bar"}
                    style={{ blockSize: `${val}%` }}
                  />
                ))}
              </div>

              <ol className="kin-station-mini">
                {t.stations.map((station, idx) => (
                  <li key={station.code}>
                    <span className="kin-station-code mono" dir="ltr">
                      {String(idx + 1).padStart(2, "0")} · {station.code}
                    </span>
                    <div className="kin-station-copy">
                      <strong>{station.title}</strong>
                      <p>
                        <Bidi text={station.text} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="kin-axis mono" dir="ltr" aria-hidden="true">
                <span>06:00</span>
                <span>10:00</span>
                <span>14:00</span>
                <span>18:00</span>
                <span>22:00</span>
                <span>02:00</span>
              </div>
            </div>
          </div>

          <div className="kin-reel-viewport" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
