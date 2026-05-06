"use client";

import { ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type WorkGalleryProps = {
  title: string;
  images: string[];
  slug: string;
};

export function WorkGallery({ title, images, slug }: WorkGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const maxIndex = images.length - 1;

  const goPrev = () => setIndex((v) => (v <= 0 ? maxIndex : v - 1));
  const goNext = () => setIndex((v) => (v >= maxIndex ? 0 : v + 1));
  const zoomIn = () => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
  const zoomOut = () => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) setZoom(1);
  }, [open]);

  return (
    <>
      <article className="grid gap-3 sm:grid-cols-2">
        {images.map((image, imageIndex) => (
          <button
            key={`${slug}-${imageIndex}`}
            type="button"
            onClick={() => {
              setIndex(imageIndex);
              setOpen(true);
            }}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-bg-secondary text-left"
          >
            <Image
              src={image}
              alt={`${title} screenshot ${imageIndex + 1}`}
              fill
              className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading={imageIndex < 2 ? "eager" : "lazy"}
            />
            <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs text-white/90 backdrop-blur">
              <Search className="h-3.5 w-3.5" />
              View
            </span>
          </button>
        ))}
      </article>

      {open ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 rounded-full border border-white/20 bg-black/40 p-3 text-white hover:bg-black/60"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            className="relative h-[70vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black/30"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index]}
              alt={`${title} screenshot ${index + 1}`}
              fill
              className="object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
              sizes="100vw"
              priority
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 rounded-full border border-white/20 bg-black/40 p-3 text-white hover:bg-black/60"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-2 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={zoomOut}
              className="rounded p-1 hover:bg-white/10"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[4rem] text-center text-xs">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={zoomIn}
              className="rounded p-1 hover:bg-white/10"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="ml-2 text-xs text-white/80">
              {index + 1}/{images.length}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}

