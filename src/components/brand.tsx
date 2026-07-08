import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandProps = {
  className?: string;
};

export function Brand({ className }: BrandProps) {
  return (
    <Link
      href="/"
      className={cn("rf-focus inline-flex min-h-11 items-center gap-3 rounded-full text-[#f5f1e8]", className)}
      aria-label="KreoFlow на главную"
    >
      <span className="grid size-10 place-items-center rounded-full border border-[#d8ff3e]/40 bg-[#d8ff3e] text-[0.7rem] font-black text-[#080909]">
        KF
      </span>
      <span className="leading-none">
        <span className="block font-display text-xl font-black uppercase tracking-tight">KreoFlow</span>
        <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#d8ff3e]">
          content line
        </span>
      </span>
    </Link>
  );
}
