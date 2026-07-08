"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCopy,
  Download,
  ExternalLink,
  MessageCircle,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { getOrdersSnapshot, getServerOrdersSnapshot, subscribeOrders } from "@/lib/storage";
import type { CreativeAsset, Order } from "@/lib/types";
import { cn, formatDate, getStatusIndex, orderedStatuses, statusMeta } from "@/lib/utils";

export function DeliveryQueryClient() {
  const searchParams = useSearchParams();
  return <DeliveryClient orderId={searchParams.get("orderId") ?? "rf-demo-beauty"} />;
}

export function DeliveryClient({ orderId = "rf-demo-beauty" }: { orderId?: string }) {
  const resolvedOrderId = orderId;
  const [copied, setCopied] = useState<string>("");
  const ordersSnapshot = useSyncExternalStore(
    subscribeOrders,
    getOrdersSnapshot,
    getServerOrdersSnapshot,
  );
  const orders = useMemo(() => JSON.parse(ordersSnapshot) as Order[], [ordersSnapshot]);
  const order = useMemo(
    () => orders.find((item) => item.id === resolvedOrderId),
    [orders, resolvedOrderId],
  );

  const progress = useMemo(() => (order ? getStatusIndex(order.status) : 0), [order]);

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    window.setTimeout(() => setCopied(""), 1500);
  }

  if (!order) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <section className="rf-panel max-w-xl rounded-[8px] p-8 text-center">
          <h1 className="text-3xl font-black text-slate-950">Галерея не найдена</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Такого заказа нет в localStorage этого браузера. Открой Studio или создай новый бриф.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link className="rf-focus rounded-md bg-slate-950 px-5 py-3 font-bold text-white" href="/studio">
              Открыть Studio
            </Link>
            <Link className="rf-focus rounded-md border border-slate-200 bg-white px-5 py-3 font-bold text-slate-950" href="/brief">
              Новый бриф
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Brand />
          <div className="flex gap-2">
            <Link
              href="/studio"
              className="rf-focus inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-950"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Studio
            </Link>
            <Link
              href="/brief"
              className="rf-focus inline-flex min-h-11 items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
            >
              Новый пакет
              <Sparkles size={16} aria-hidden="true" />
            </Link>
          </div>
        </header>

        <section className="rf-panel overflow-hidden rounded-[8px]">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <p className="rf-kicker text-rose-700">Delivery page</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                {order.brief.businessName}: пакет креативов
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Здесь собраны сценарии, ролики, подписи и контент-план. Страница
                работает как клиентская выдача: без папок, хаоса и потерянных файлов.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Metric label="Статус" value={statusMeta[order.status].label} />
                <Metric label="Создано" value={formatDate(order.createdAt)} />
                <Metric label="Ассеты" value={`${order.assets.length} ролика`} />
              </div>
            </div>
            <div className="rounded-md border border-slate-950 bg-slate-950 p-5 text-white">
              <p className="font-mono text-xs font-semibold uppercase text-white/55">
                Production progress
              </p>
              <div className="mt-5 space-y-3">
                {orderedStatuses.map((status, index) => (
                  <div key={status} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-md border text-xs font-bold",
                        index <= progress
                          ? "border-rose-300 bg-rose-500 text-white"
                          : "border-white/15 text-white/35",
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className={cn("font-bold", index <= progress ? "text-white" : "text-white/38")}>
                      {statusMeta[status].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="space-y-5">
            <article className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
              <p className="rf-kicker text-blue-700">Creative strategy</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Углы и хуки</h2>
              <div className="mt-4 space-y-3">
                {order.plan.angles.slice(0, 4).map((angle) => (
                  <p key={angle} className="rounded-md bg-rose-50 p-3 text-sm leading-6 text-slate-700">
                    {angle}
                  </p>
                ))}
              </div>
            </article>

            <article className="rounded-[8px] border border-blue-100 bg-blue-50 p-5">
              <p className="rf-kicker text-blue-700">Content calendar</p>
              <div className="mt-4 space-y-3">
                {order.plan.contentCalendar.map((item) => (
                  <div key={`${item.day}-${item.idea}`} className="rounded-md bg-white p-3">
                    <p className="font-bold text-slate-950">{item.day} · {item.platform}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.idea}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="rf-kicker text-rose-700">Assets</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">Готовые ролики и подписи</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {order.assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  copied={copied === asset.id}
                  onCopy={() => copyText(asset.id, asset.caption)}
                />
              ))}
            </div>
          </section>
        </section>

        <section className="my-8 rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="rf-kicker text-rose-700">Revision request</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Нужна правка или следующая партия?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Напишите менеджеру: {order.brief.contactName} · {order.brief.contactMethod}
              </p>
            </div>
            <a
              href={`mailto:${order.brief.contactMethod.includes("@") ? "" : order.brief.contactMethod}`}
              className="rf-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-rose-700"
            >
              Запросить правку
              <MessageCircle size={18} aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-rose-100 bg-white p-4">
      <p className="font-mono text-xs font-semibold uppercase text-rose-700">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function AssetCard({
  asset,
  copied,
  onCopy,
}: {
  asset: CreativeAsset;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-rose-100 bg-white shadow-sm">
      <div className={cn("relative grid aspect-[9/12] place-items-center bg-gradient-to-br", gradientFor(asset))}>
        <div className="absolute inset-0 rf-grid opacity-20" aria-hidden="true" />
        <div className="relative grid size-16 place-items-center rounded-full border border-white/55 bg-white/25 text-white backdrop-blur">
          <PlayCircle size={34} aria-hidden="true" />
        </div>
        <span className="absolute bottom-4 left-4 rounded-md bg-slate-950/70 px-3 py-2 font-mono text-xs font-semibold uppercase text-white">
          {asset.platform}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-950">{asset.title}</h3>
            <p className="mt-1 text-xs font-semibold uppercase text-rose-700">{asset.status}</p>
          </div>
          {asset.status === "approved" ? <CheckCircle2 className="text-emerald-600" size={20} aria-hidden="true" /> : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{asset.caption}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCopy}
            className="rf-focus inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 transition hover:border-slate-950"
          >
            {copied ? "Скопировано" : "Скопировать подпись"}
            <ClipboardCopy size={15} aria-hidden="true" />
          </button>
          {asset.videoUrl ? (
            <a
              href={asset.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="rf-focus inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
            >
              Открыть
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-400"
            >
              Файл позже
              <Download size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function gradientFor(asset: CreativeAsset) {
  if (asset.thumbnailUrl === "gradient-blue") {
    return "from-blue-700 via-cyan-400 to-rose-200";
  }
  if (asset.thumbnailUrl?.startsWith("http")) {
    return "from-slate-900 via-slate-700 to-slate-500";
  }
  return "from-rose-600 via-fuchsia-500 to-orange-300";
}
