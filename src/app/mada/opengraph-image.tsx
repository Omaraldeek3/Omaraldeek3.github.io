import { ImageResponse } from "next/og";

export const alt = "Mada: One team. A clearer horizon.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#eef3ff", color: "#112247", padding: "65px 75px", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "65%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="52" height="52" viewBox="0 0 64 64"><path d="M7 49V26c0-12 15-17 22-6l3 5 3-5c7-11 22-6 22 6v23H44V28L32 46 20 28v21Z" fill="#2854de" /></svg>
          <span style={{ fontSize: 35, fontWeight: 700, letterSpacing: -2 }}>mada</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 71, fontWeight: 700, letterSpacing: -3 }}>One team.</span>
          <span style={{ fontSize: 71, fontWeight: 700, letterSpacing: -3, color: "#2854de" }}>A clearer horizon.</span>
        </div>
        <span style={{ fontSize: 21, color: "#7183a4" }}>PROJECTS. PEOPLE. PROGRESS.</span>
      </div>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", gap: 20, width: 330, right: -15, top: 120, transform: "rotate(-12deg)", padding: 26, background: "white", border: "1px solid #d7e2f6", borderRadius: 20, boxShadow: "0 20px 60px #2854de20" }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>A space for your next idea.</span>
        <div style={{ display: "flex", background: "#e8eefb", height: 8, borderRadius: 8 }}><div style={{ width: "75%", height: "100%", background: "#2854de", borderRadius: 8 }} /></div>
        {["Define the vision", "Make a plan", "Build together"].map((text, index) => <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, height: 54, color: "#677998", borderBottom: "1px solid #e8eefb", fontSize: 17 }}><span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, background: index < 2 ? "#e1eee9" : "#e6edff", color: index < 2 ? "#458874" : "#2854de", borderRadius: 6 }}>{index < 2 ? <svg width="16" height="16" viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" fill="none" stroke="#458874" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : "3"}</span>{text}</div>)}
        <span style={{ fontSize: 14, color: "#9aa9c2" }}>Every step makes a difference.</span>
      </div>
    </div>,
    size,
  );
}
