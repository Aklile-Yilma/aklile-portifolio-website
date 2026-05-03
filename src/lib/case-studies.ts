import fs from "node:fs";
import path from "node:path";

import {
  CASE_STUDY_COPY,
  FEATURED_CASE_SLUGS,
  type CaseStudyCopy,
} from "./case-study-copy";

export type CaseStudy = {
  slug: string;
  title: string;
  id: string;
  clientUrl: string;
  showcaseImage: string;
  tags: string[];
  bullets: string[];
  testimonial?: CaseStudyCopy["testimonial"];
};

type ManifestImage = {
  filename: string | null;
  missing?: boolean;
  role: string;
};

type Manifest = {
  slug: string;
  title: string;
  projectId: string;
  images: ManifestImage[];
};

function readManifest(slug: string): Manifest | null {
  const dir = path.join(process.cwd(), "public", "portfolio", slug);
  const fp = path.join(dir, "manifest.json");
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf8")) as Manifest;
}

function pickShowcaseImage(manifest: Manifest): string | null {
  const ok = manifest.images.filter((i) => i.filename && !i.missing);
  const gallery = ok.find((i) => i.role === "gallery");
  const file = gallery?.filename ?? ok[1]?.filename ?? ok[0]?.filename;
  return file ? `/portfolio/${manifest.slug}/${file}` : null;
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  const out: CaseStudy[] = [];
  for (const slug of FEATURED_CASE_SLUGS) {
    const manifest = readManifest(slug);
    if (!manifest) continue;
    const showcaseImage = pickShowcaseImage(manifest);
    if (!showcaseImage) continue;
    const copy = CASE_STUDY_COPY[slug] ?? {
      clientUrl: "#",
      tags: ["Full-stack"],
      bullets: [
        "Delivered production features with clear communication and ownership.",
      ],
    };
    out.push({
      slug,
      title: manifest.title,
      id: manifest.projectId,
      clientUrl: copy.clientUrl,
      showcaseImage,
      tags: copy.tags,
      bullets: copy.bullets,
      testimonial: copy.testimonial,
    });
  }
  return out;
}
