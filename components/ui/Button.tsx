import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

const base =
  "inline-flex items-center justify-center gap-2 px-7 py-3 text-sm tracking-[0.08em] uppercase font-medium transition-colors duration-300 rounded-[2px]";

const variants: Record<string, string> = {
  primary: "bg-primary text-cream hover:bg-primary-deep",
  outline: "border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-cream",
  ghost: "text-primary hover:text-gold underline-offset-8 decoration-1 hover:underline px-0 py-0",
};

export function Button({ href, children, variant = "primary", className = "", onClick, type = "button" }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
