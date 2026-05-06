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
  summary: string;
  role: string;
  approach: string[];
  outcome: string[];
  loomUrl?: string;
  coverImage: string;
  showcaseImage: string;
  gallery: string[];
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

function pickGalleryImages(manifest: Manifest): string[] {
  const ok = manifest.images.filter((i) => i.filename && !i.missing);
  return ok
    .map((i) => i.filename)
    .filter((file): file is string => Boolean(file))
    .map((file) => `/portfolio/${manifest.slug}/${file}`);
}

function pickCoverImage(manifest: Manifest): string | null {
  const ok = manifest.images.filter((i) => i.filename && !i.missing);
  const cover = ok.find((i) => i.role === "cover")?.filename;
  const first = cover ?? ok[0]?.filename;
  return first ? `/portfolio/${manifest.slug}/${first}` : null;
}

function pickShowcaseImage(manifest: Manifest): string | null {
  const ok = manifest.images.filter((i) => i.filename && !i.missing);
  const gallery = ok.find((i) => i.role === "gallery")?.filename;
  const file = gallery ?? ok[1]?.filename ?? ok[0]?.filename;
  return file ? `/portfolio/${manifest.slug}/${file}` : null;
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  const out: CaseStudy[] = [];
  for (const slug of FEATURED_CASE_SLUGS) {
    const manifest = readManifest(slug);
    if (!manifest) continue;
    const showcaseImage = pickShowcaseImage(manifest);
    const coverImage = pickCoverImage(manifest);
    const gallery = pickGalleryImages(manifest);
    if (!showcaseImage || !coverImage || gallery.length === 0) continue;
    const copy = CASE_STUDY_COPY[slug] ?? {
      clientUrl: "#",
      summary: "Production client engagement delivered with ownership and clear communication.",
      role: "Full-stack product engineer.",
      approach: ["Delivered iterative features with clear communication and ownership."],
      outcome: ["Shipped reliable improvements with production quality."],
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
      summary: copy.summary,
      role: copy.role,
      approach: copy.approach,
      outcome: copy.outcome,
      loomUrl: copy.loomUrl,
      coverImage,
      showcaseImage,
      gallery,
      tags: copy.tags,
      bullets: copy.bullets,
      testimonial: copy.testimonial,
    });
  }
  return out;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  return getFeaturedCaseStudies().find((item) => item.slug === slug) ?? null;
}
