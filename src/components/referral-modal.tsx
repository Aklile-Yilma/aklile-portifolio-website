"use client";

import { Check, Copy, Gift, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { referralShareUrl } from "@/lib/site-config";

type ReferralModalProps = {
  open: boolean;
  onClose: () => void;
};

const REFERRAL_ID_KEY = "aklile_referral_id_v1";
const REFERRAL_URL_KEY = "aklile_referral_url_v1";
const REFERRER_NAME_KEY = "aklile_referrer_name_v1";

export function ReferralModal({ open, onClose }: ReferralModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loadingLink, setLoadingLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureReferralLink = useCallback(async () => {
    if (typeof window === "undefined") return;

    const storedCode = window.localStorage.getItem(REFERRAL_ID_KEY);
    const storedUrl = window.localStorage.getItem(REFERRAL_URL_KEY);
    const storedName = window.localStorage.getItem(REFERRER_NAME_KEY);

    if (storedCode && storedName) {
      setName(storedName);
      setUrl(storedUrl ?? referralShareUrl(storedCode));
    } else {
      window.localStorage.removeItem(REFERRAL_ID_KEY);
      window.localStorage.removeItem(REFERRAL_URL_KEY);
      setUrl("");
    }
  }, []);

  const createReferralLink = useCallback(async () => {
    if (typeof window === "undefined") return;
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    setLoadingLink(true);
    setError(null);
    try {
      const response = await fetch("/api/referrals/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ name: cleanName }),
      });
      const data = (await response.json()) as {
        code?: string;
        url?: string;
        error?: string;
      };
      if (response.ok && data.code) {
        const referralUrl = data.url ?? referralShareUrl(data.code);
        window.localStorage.setItem(REFERRAL_ID_KEY, data.code);
        window.localStorage.setItem(REFERRAL_URL_KEY, referralUrl);
        window.localStorage.setItem(REFERRER_NAME_KEY, cleanName);
        setUrl(referralUrl);
        setName(cleanName);
      } else {
        setError(data.error ?? "Could not generate referral link.");
      }
    } catch {
      setError("Network error while generating link. Please try again.");
    } finally {
      setLoadingLink(false);
    }
  }, [name]);

  useEffect(() => {
    void ensureReferralLink();
  }, [ensureReferralLink]);

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
    if (loadingLink || !url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, [loadingLink, url]);

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
          <label className="w-full">
            <span className="mb-2 block text-xs text-text-tertiary">
              Your name or company (required)
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Selam or Acme Studio"
              className="w-full rounded-xl border border-white/[0.1] bg-bg-primary/80 px-3 py-2.5 text-sm text-text-primary outline-none ring-accent/40 transition focus:ring-2"
              maxLength={80}
            />
          </label>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 truncate rounded-xl border border-white/[0.1] bg-bg-primary/80 px-3 py-2.5 text-center font-mono text-[11px] text-text-secondary sm:text-left">
            {loadingLink
              ? "Generating referral link..."
              : url || "Enter your name, then generate your referral link."}
          </div>
          <button
            type="button"
            onClick={createReferralLink}
            disabled={loadingLink || !name.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.18] px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Generate
          </button>
          <button
            type="button"
            onClick={copy}
            disabled={loadingLink || !url}
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

        {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      </div>
    </dialog>
  );
}
