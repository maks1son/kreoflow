import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandProps = {
  className?: string;
};

export function Brand({ className }: BrandProps) {
  return (
    <Link
      href="/"
      className={cn("rf-focus inline-flex min-h-11 items-center rounded-full text-[#f5f1e8]", className)}
      aria-label="KreoFlow на главную"
    >
      <span className="leading-none">
        <span className="block font-display text-xl font-black uppercase tracking-tight">KreoFlow</span>
        <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#d8ff3e]">
          content line
        </span>
      </span>
    </Link>
  );
}
