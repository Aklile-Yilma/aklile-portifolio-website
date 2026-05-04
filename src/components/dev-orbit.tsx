"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import type { HeroOrbitSkill } from "@/lib/content";

type DevOrbitProps = {
  skills: readonly HeroOrbitSkill[];
  /** Icon tile (Tailwind), e.g. h-11 w-11 md:h-14 md:w-14 */
  tileClassName?: string;
};

const CYCLE_MS_LEFT = 4200;
const CYCLE_MS_RIGHT = 5200;

const LEFT_SLOTS = [
  { x: 5, y: 18 },
  { x: 9, y: 34 },
  { x: 6, y: 52 },
  { x: 11, y: 70 },
  { x: 16, y: 84 },
 ] as const;

const RIGHT_SLOTS = [
  { x: 84, y: 20 },
  { x: 91, y: 36 },
  { x: 94, y: 54 },
  { x: 89, y: 72 },
  { x: 84, y: 86 },
] as const;

function nextRandomIndex(length: number, previous: number): number {
  if (length <= 1) return 0;
  const next = Math.floor(Math.random() * (length - 1));
  return next >= previous ? next + 1 : next;
}

/**
 * Eskalate-like floating side icons: two visible at once (left + right), each
 * reappearing in random side slots while keeping the center headline clear.
 */
export function DevOrbit({
  skills,
  tileClassName = "h-10 w-10 md:h-[3.25rem] md:w-[3.25rem]",
}: DevOrbitProps) {
  const prefersReducedMotion = useReducedMotion();
  const [failed, setFailed] = useState<string[]>([]);
  const available = useMemo(() => {
    const filtered = skills.filter((s) => !failed.includes(s.label));
    // Keep enough icons for both sides even if CDN hiccups happen.
    if (filtered.length >= 2) return filtered;
    return skills.slice(0, Math.max(2, skills.length));
  }, [skills, failed]);
  const n = available.length;
  const [leftSkill, setLeftSkill] = useState(0);
  const [rightSkill, setRightSkill] = useState(1);
  const [leftSlot, setLeftSlot] = useState(0);
  const [rightSlot, setRightSlot] = useState(0);
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);
  const leftRef = useRef(0);
  const leftTimeoutRef = useRef<number | null>(null);
  const rightTimeoutRef = useRef<number | null>(null);
  const safeLeftSkill = n <= 1 ? 0 : ((leftSkill % n) + n) % n;
  const rawRightSkill = n <= 1 ? 0 : ((rightSkill % n) + n) % n;
  const safeRightSkill =
    n <= 1
      ? 0
      : rawRightSkill === safeLeftSkill
        ? (safeLeftSkill + 1) % n
        : rawRightSkill;

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (n <= 1) return;

    const leftId = window.setInterval(() => {
      setLeftVisible(false);
      if (leftTimeoutRef.current) window.clearTimeout(leftTimeoutRef.current);
      leftTimeoutRef.current = window.setTimeout(() => {
        setLeftSkill((prev) => nextRandomIndex(n, ((prev % n) + n) % n));
        setLeftSlot((prev) => nextRandomIndex(LEFT_SLOTS.length, prev));
        setLeftVisible(true);
      }, 260);
    }, CYCLE_MS_LEFT);

    const rightId = window.setInterval(() => {
      setRightVisible(false);
      if (rightTimeoutRef.current) window.clearTimeout(rightTimeoutRef.current);
      rightTimeoutRef.current = window.setTimeout(() => {
        setRightSkill((prev) => {
          const next = nextRandomIndex(n, ((prev % n) + n) % n);
          return next === leftRef.current ? (next + 1) % n : next;
        });
        setRightSlot((prev) => nextRandomIndex(RIGHT_SLOTS.length, prev));
        setRightVisible(true);
      }, 260);
    }, CYCLE_MS_RIGHT);

    return () => {
      window.clearInterval(leftId);
      window.clearInterval(rightId);
      if (leftTimeoutRef.current) window.clearTimeout(leftTimeoutRef.current);
      if (rightTimeoutRef.current) window.clearTimeout(rightTimeoutRef.current);
    };
  }, [n, prefersReducedMotion]);

  useEffect(() => {
    leftRef.current = safeLeftSkill;
  }, [safeLeftSkill]);

  const left = available[safeLeftSkill];
  const right = available[safeRightSkill];
  if (!left || prefersReducedMotion) return null;
  const leftPos = LEFT_SLOTS[leftSlot];
  const rightPos = RIGHT_SLOTS[rightSlot];

  const markFailed = (label: string) => {
    // Do not over-prune the pool; keep rotation healthy.
    if (available.length <= 4) return;
    setFailed((prev) => (prev.includes(label) ? prev : [...prev, label]));
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[3]" aria-hidden>
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${leftPos.x}%`, top: `${leftPos.y}%` }}
        animate={
          leftVisible
            ? { opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)" }
            : { opacity: 0, scale: 0.84, x: -10, y: -8, filter: "blur(3px)" }
        }
        transition={{
          duration: 0.58,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity }}
          className={`relative rounded-full border border-white/12 bg-bg-elevated/90 p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-sm ${tileClassName}`}
        >
          <Image
            src={left.src}
            alt=""
            fill
            className="object-contain p-1"
            sizes="(max-width: 768px) 40px, 52px"
            onError={() => markFailed(left.label)}
          />
        </motion.div>
      </motion.div>

      {right && n > 1 ? (
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${rightPos.x}%`, top: `${rightPos.y}%` }}
          animate={
            rightVisible
              ? { opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)" }
              : { opacity: 0, scale: 0.84, x: 10, y: -8, filter: "blur(3px)" }
          }
          transition={{
            duration: 0.58,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity }}
            className={`relative rounded-full border border-white/12 bg-bg-elevated/90 p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-sm ${tileClassName}`}
          >
            <Image
              src={right.src}
              alt=""
              fill
              className="object-contain p-1"
              sizes="(max-width: 768px) 40px, 52px"
              onError={() => markFailed(right.label)}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}
