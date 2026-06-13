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

export type SecondaryButtonProps = ButtonProps | LinkProps;

export function SecondaryButton(props: SecondaryButtonProps) {
  const { children, className = "", size = "md", fullWidth, ...rest } = props;

  // Pill-shaped, transparent with strong border — mirrors PWC's ghost CTA.
  const base = [
    "inline-flex items-center justify-center gap-2 select-none whitespace-nowrap",
    "rounded-full font-semibold tracking-tight",
    "bg-transparent text-ink",
    "border border-[#2f2f38] hover:bg-bg-card",
    "transition-[transform,background-color,border-color] duration-200 ease-out",
    "active:scale-[0.98]",
    "outline-none focus-visible:ring-2 focus-visible:ring-[#2f2f38]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
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

export default SecondaryButton;
