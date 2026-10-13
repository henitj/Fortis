import { ImageResponse } from "next/og";

export const alt = "FORTIS — Strength Through Preparation. Personalized household emergency plans.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#101820",
          color: "#F4F2ED",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="76" height="76" viewBox="0 0 32 32">
            <path
              d="M16 2.25c.32 0 .63.06.93.17l9.2 3.45A2.4 2.4 0 0 1 27.7 8.12v6.66c0 6.7-4.28 11.83-10.86 14.73a2.06 2.06 0 0 1-1.68 0C8.58 26.61 4.3 21.48 4.3 14.78V8.12a2.4 2.4 0 0 1 1.57-2.25l9.2-3.45c.3-.11.61-.17.93-.17Z"
              fill="#22303c"
              stroke="rgba(244,242,237,0.25)"
              strokeWidth="0.8"
            />
            <path
              d="M10.6 15.6 15.18 11.7a1.27 1.27 0 0 1 1.64 0l4.58 3.9c.29.24.45.6.45.97v5.68c0 .7-.57 1.27-1.27 1.27h-2.54v-3.6a2.04 2.04 0 0 0-4.08 0v3.6h-2.54c-.7 0-1.27-.57-1.27-1.27v-5.68c0-.37.16-.73.45-.97Z"
              fill="#D9A441"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: 8 }}>FORTIS</span>
            <span style={{ fontSize: 22, color: "#D9A441", letterSpacing: 1 }}>Strength Through Preparation.</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 940 }}>
            Prepared for the unexpected. Ready for what matters.
          </span>
          <span style={{ fontSize: 28, color: "rgba(244,242,237,0.7)", maxWidth: 900 }}>
            A personalized emergency plan for your household — built from transparent rules, saved only on your device.
          </span>
        </div>
      </div>
    ),
    size,
  );
}
