import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export default function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={clsx("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)} {...rest}>
      {children}
    </div>
  );
}
