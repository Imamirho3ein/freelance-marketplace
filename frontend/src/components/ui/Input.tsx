import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

export default function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx("w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20", className)}
      {...rest}
    />
  );
}
