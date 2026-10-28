import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-slate-800 text-white hover:bg-slate-900",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
};
const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };

export default function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: Props) {
  return (
    <button
      className={clsx("inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed", variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </button>
  );
}
