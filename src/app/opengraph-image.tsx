import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-config";

export const size = {
  width: 1200,
  height: 630,
};

export const alt = `${siteConfig.name} - ${siteConfig.title}`;
export const contentType = "image/png";

export default function OpenGraphImage() {
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
            "radial-gradient(circle at 18% 82%, rgba(246,196,85,0.24) 0%, rgba(0,0,0,0) 36%), radial-gradient(circle at 88% 8%, rgba(104,86,230,0.22) 0%, rgba(0,0,0,0) 35%), #0D0D0D",
          color: "#F2F2F2",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, color: "#F6C455", letterSpacing: 1 }}>
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", fontSize: 62, fontWeight: 700, lineHeight: 1.05 }}>
            {siteConfig.heroHeadline.line1}
          </div>
          <div style={{ display: "flex", fontSize: 62, fontWeight: 700, lineHeight: 1.05, color: "#FFB74D" }}>
            {siteConfig.heroHeadline.line2}
          </div>
          <div style={{ display: "flex", marginTop: 12, maxWidth: 980, fontSize: 28, color: "#B3B3B3" }}>
            {siteConfig.description}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
