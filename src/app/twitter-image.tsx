import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-config";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "radial-gradient(circle at 20% 84%, rgba(246,196,85,0.2) 0%, rgba(0,0,0,0) 32%), radial-gradient(circle at 85% 12%, rgba(104,86,230,0.2) 0%, rgba(0,0,0,0) 34%), #0B0B0B",
          color: "#F7F7F7",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 1, color: "#F6C455" }}>{siteConfig.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 700, lineHeight: 1.08 }}>
            {siteConfig.title}
          </div>
          <div style={{ display: "flex", maxWidth: 980, fontSize: 28, color: "#B3B3B3" }}>{siteConfig.description}</div>
        </div>
      </div>
    ),
    size,
  );
}
