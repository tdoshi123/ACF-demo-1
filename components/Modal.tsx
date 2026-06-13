"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
}

/**
 * Lightweight portal-free modal. Renders fixed over the app shell, closes on
 * backdrop click and ESC. Keeps focus simple — no trap — because the lesson
 * modal is read-only and dismissable.
 */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  subtitle,
  children,
  footer,
  maxWidthClassName = "max-w-2xl",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-3 py-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        className={`relative z-10 flex max-h-[calc(100dvh-2rem)] w-full ${maxWidthClassName} flex-col rounded-3xl border border-white/10 bg-bg-elevated shadow-2xl`}
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {eyebrow && <div className="text-eyebrow">{eyebrow}</div>}
            {title && (
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-bg-card/80 text-ink-secondary hover:text-ink"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>

        {footer && (
          <footer className="border-t border-white/5 px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

export default Modal;
