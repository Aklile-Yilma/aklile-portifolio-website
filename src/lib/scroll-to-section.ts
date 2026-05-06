"use client";

export function scrollToSection(id: string) {
  if (typeof window === "undefined") return;
  const node = document.getElementById(id);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "start" });
}

