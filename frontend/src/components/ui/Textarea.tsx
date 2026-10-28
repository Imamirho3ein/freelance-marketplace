import { clsx } from "clsx";
import type { TextareaHTMLAttributes } from "react";

export default function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx("w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20", className)}
      {...rest}
    />
  );
}
