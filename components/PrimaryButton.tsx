"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type CommonProps = {
  children: ReactNode;
  className?: string;
  size?: "md" | "lg";
  fullWidth?: boolean;
};

type ButtonProps = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: undefined;
  };

type LinkProps = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children" | "href"> & {
    href: string;
  };

export type PrimaryButtonProps = ButtonProps | LinkProps;

export function PrimaryButton(props: PrimaryButtonProps) {
  const { children, className = "", size = "md", fullWidth, ...rest } = props;

  // Pill-shaped, solid gold on black — mirrors PWC's primary CTA.
  const base = [
    "inline-flex items-center justify-center gap-2 select-none whitespace-nowrap",
    "rounded-full font-semibold tracking-tight",
    "bg-gold text-black hover:bg-gold-soft",
    "shadow-gold hover:shadow-glow",
    "transition-[transform,background-color,box-shadow] duration-200 ease-out",
    "active:scale-[0.98]",
    "outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-gold",
    size === "lg" ? "h-12 px-6 text-[15px]" : "h-10 px-5 text-sm",
    fullWidth ? "w-full" : "",
    className,
  ].join(" ");

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} className={base} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={base} {...(rest as ButtonProps)}>
      {children}
    </button>
  );
}

export default PrimaryButton;
