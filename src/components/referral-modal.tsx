"use client";

import { Check, Copy, Gift, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { referralShareUrl } from "@/lib/site-config";

type ReferralModalProps = {
  open: boolean;
  onClose: () => void;
};

const REFERRAL_ID_KEY = "aklile_referral_id_v1";

function generateReferralCode() {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  const timePart = Date.now().toString(36);
  return `akl-${timePart}${randomPart}`;
}

export function ReferralModal({ open, onClose }: ReferralModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(() => referralShareUrl());

  useEffect(() => {
    if (typeof window === "undefined") return;
    let referralCode = window.localStorage.getItem(REFERRAL_ID_KEY);
    if (!referralCode) {
      referralCode = generateReferralCode();
      window.localStorage.setItem(REFERRAL_ID_KEY, referralCode);
    }
    setUrl(referralShareUrl(referralCode));
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  const handleDialogClose = useCallback(() => {
    onClose();
    setCopied(false);
  }, [onClose]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, [url]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="z-[200] m-auto max-h-[min(90dvh,calc(100%+2rem))] w-[calc(100%-2rem)] max-w-md border-0 bg-transparent p-0 backdrop:bg-black/65 backdrop:backdrop-blur-sm"
      onClose={handleDialogClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div
        className="glass relative w-full rounded-2xl border border-white/[0.1] p-6 shadow-2xl md:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="absolute top-3.5 right-3.5 rounded-lg p-2 text-text-tertiary transition-colors hover:bg-white/10 hover:text-text-primary"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <Gift className="h-5 w-5" strokeWidth={1.75} />
        </div>

        <h2
          id={titleId}
          className="text-center font-display text-xl font-semibold tracking-tight text-text-primary md:text-2xl"
        >
          Refer me
        </h2>

        <p className="mt-3 text-center text-sm text-text-secondary">
          <strong className="text-text-primary">10% off</strong> the first milestone
          for anyone who books through your link.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 truncate rounded-xl border border-white/[0.1] bg-bg-primary/80 px-3 py-2.5 text-center font-mono text-[11px] text-text-secondary sm:text-left">
            {url}
          </div>
          <button
            type="button"
            onClick={copy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[oklch(0.14_0.04_75)] transition-colors hover:bg-accent-hover"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy link
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
