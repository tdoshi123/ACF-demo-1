import type { ReactNode } from "react";

export interface SectionCardProps {
  title?: ReactNode;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  elevated?: boolean;
}

export function SectionCard({
  title,
  eyebrow,
  subtitle,
  right,
  children,
  className = "",
  bodyClassName = "",
  elevated = false,
}: SectionCardProps) {
  return (
    <section
      className={`${elevated ? "surface-elevated" : "surface-card"} ${className}`}
    >
      {(title || eyebrow || subtitle || right) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            {eyebrow && <div className="text-eyebrow">{eyebrow}</div>}
            {title && (
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className={`px-5 pb-5 pt-4 sm:px-6 sm:pb-6 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}

export default SectionCard;
