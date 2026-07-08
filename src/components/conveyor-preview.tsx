import { ArrowRight, BadgeCheck, Captions, FileText, Sparkles, Video } from "lucide-react";
import { cn, orderedStatuses, statusMeta } from "@/lib/utils";

const cardGradients = [
  "from-rose-500 via-orange-300 to-yellow-200",
  "from-cyan-300 via-sky-200 to-slate-100",
  "from-blue-600 via-indigo-500 to-rose-300",
  "from-fuchsia-500 via-rose-400 to-slate-900",
];

export function ConveyorPreview() {
  return (
    <div className="rf-panel overflow-hidden rounded-[8px] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="rf-kicker text-rose-700">Live production map</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
            Бриф превращается в пакет роликов
          </h2>
        </div>
        <div className="hidden items-center gap-1 rounded-md bg-slate-950 px-3 py-2 font-mono text-xs font-semibold text-white sm:flex">
          <BadgeCheck size={15} aria-hidden="true" />
          72h
        </div>
      </div>

      <div className="grid gap-2 lg:grid-cols-5">
        {orderedStatuses.map((status, index) => {
          const Icon = [FileText, Sparkles, Video, Captions, BadgeCheck][index];
          return (
            <div
              key={status}
              className={cn(
                "rounded-md border p-3 transition",
                index === 2
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-rose-100 bg-white/82 text-slate-900",
              )}
            >
              <div className="mb-5 flex items-center justify-between">
                <Icon size={18} aria-hidden="true" />
                <span className="font-mono text-[0.65rem] font-semibold uppercase opacity-75">
                  0{index + 1}
                </span>
              </div>
              <p className="text-sm font-bold">{statusMeta[status].shortLabel}</p>
              <p className={cn("mt-1 text-xs leading-5", index === 2 ? "text-white/70" : "text-slate-500")}>
                {statusMeta[status].label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <PhoneStack />
        <div className="hidden justify-center text-rose-600 md:flex">
          <ArrowRight aria-hidden="true" size={26} />
        </div>
        <div className="rounded-md border border-blue-100 bg-blue-50/80 p-4">
          <p className="font-mono text-xs font-semibold uppercase text-blue-700">
            Delivery gallery
          </p>
          <h3 className="mt-2 text-lg font-black text-slate-950">
            12 роликов, подписи и тест-матрица
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Клиент получает не ссылку на облако, а аккуратную страницу с креативами,
            сценариями, CTA и статусами.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PhoneStack() {
  return (
    <div className="relative min-h-72 overflow-hidden rounded-md border border-rose-100 bg-white p-5">
      <div className="absolute inset-0 rf-grid opacity-70" aria-hidden="true" />
      <div className="relative flex h-64 items-end justify-center">
        {cardGradients.map((gradient, index) => (
          <div
            key={gradient}
            className={cn(
              "relative -ml-3 flex h-56 w-24 flex-col justify-between rounded-[22px] border-[5px] border-slate-950 bg-gradient-to-b p-3 shadow-2xl first:ml-0 sm:w-28",
              gradient,
              index === 2 && "z-10 h-64 w-32 sm:w-36",
              index === 0 && "-rotate-6",
              index === 1 && "-rotate-2",
              index === 3 && "rotate-5",
            )}
          >
            <div className="mx-auto h-4 w-12 rounded-full bg-slate-950" />
            <div className="grid place-items-center">
              <div className="grid size-11 place-items-center rounded-full border border-white/55 bg-white/20 text-white">
                <Video size={20} aria-hidden="true" />
              </div>
            </div>
            <span className="mx-auto rounded-full bg-slate-950/62 px-2 py-1 font-mono text-[0.58rem] font-semibold uppercase text-white">
              {["Hook", "UGC", "Offer", "QC"][index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
