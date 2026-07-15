"use client";

import { Suspense, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CircleDot,
  ClipboardList,
  ExternalLink,
  Link2,
  LogOut,
  PanelTop,
  UploadCloud,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-provider";
import {
  getOrdersSnapshot,
  getServerOrdersSnapshot,
  subscribeOrders,
  updateAsset,
  updateOrderStatus,
} from "@/lib/storage";
import type { CreativeAsset, Order, OrderStatus } from "@/lib/types";
import { cn, formatDate, goalLabels, orderedStatuses, statusMeta, styleLabels } from "@/lib/utils";

export default function StudioPage() {
  const { configured, user, signOut } = useAuth();
  const ordersSnapshot = useSyncExternalStore(
    subscribeOrders,
    getOrdersSnapshot,
    getServerOrdersSnapshot,
  );
  const orders = useMemo(() => JSON.parse(ordersSnapshot) as Order[], [ordersSnapshot]);
  const [selectedId, setSelectedId] = useState<string>("");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) || orders[0],
    [orders, selectedId],
  );

  function setStatus(orderId: string, status: OrderStatus) {
    updateOrderStatus(orderId, status);
  }

  function patchAsset(orderId: string, asset: CreativeAsset, field: "videoUrl" | "thumbnailUrl", value: string) {
    updateAsset(orderId, asset.id, {
      [field]: value,
      status: value.trim() ? "uploaded" : asset.status,
    });
  }

  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center">Загрузка Studio…</main>}>
    <ProtectedRoute>
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Brand />
          <div className="flex gap-2">
            {configured && user ? (
              <button
                type="button"
                onClick={() => void signOut()}
                title={user.email || "Аккаунт KreoFlow"}
                className="rf-focus inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-rose-600 hover:text-rose-700"
              >
                <LogOut size={16} aria-hidden="true" />
                Выйти
              </button>
            ) : null}
            <Link
              href="/"
              className="rf-focus inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-950"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Главная
            </Link>
            <Link
              href="/brief"
              className="rf-focus inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
            >
              Новый бриф
              <ClipboardList size={16} aria-hidden="true" />
            </Link>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          {orderedStatuses.map((status) => {
            const count = orders.filter((order) => order.status === status).length;
            return (
              <div key={status} className="rounded-[8px] border border-rose-100 bg-white p-4 shadow-sm">
                <p className="font-mono text-xs font-semibold uppercase text-rose-700">
                  {statusMeta[status].shortLabel}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <p className="text-3xl font-black text-slate-950">{count}</p>
                  <CircleDot className={count ? "text-rose-600" : "text-slate-300"} size={20} aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.74fr_1.26fr]">
          <aside className="rf-panel rounded-[8px] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="rf-kicker text-blue-700">Orders</p>
                <h1 className="mt-1 text-2xl font-black text-slate-950">Studio board</h1>
              </div>
              <PanelTop className="text-rose-600" size={22} aria-hidden="true" />
            </div>
            <div className="space-y-3">
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedId(order.id)}
                  className={cn(
                    "rf-focus w-full cursor-pointer rounded-md border p-4 text-left transition",
                    selectedOrder?.id === order.id
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-rose-100 bg-white text-slate-800 hover:border-rose-300",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-black">{order.brief.businessName}</p>
                      <p className={cn("mt-1 text-xs", selectedOrder?.id === order.id ? "text-white/65" : "text-slate-500")}>
                        {formatDate(order.createdAt)} · {goalLabels[order.brief.goal]}
                      </p>
                    </div>
                    <span className="rounded-md bg-white/12 px-2 py-1 font-mono text-[0.65rem] font-semibold uppercase">
                      {statusMeta[order.status].shortLabel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {selectedOrder ? (
            <section className="space-y-5">
              <div className="rf-panel rounded-[8px] p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="rf-kicker text-rose-700">Selected order</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                      {selectedOrder.brief.businessName}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                      {selectedOrder.brief.offer}
                    </p>
                  </div>
                  <Link
                    href={`/delivery?orderId=${encodeURIComponent(selectedOrder.id)}`}
                    className="rf-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2 font-bold text-white transition hover:bg-rose-700"
                  >
                    Delivery
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-5">
                  {orderedStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatus(selectedOrder.id, status)}
                      className={cn(
                        "rf-focus min-h-14 cursor-pointer rounded-md border px-3 py-2 text-left text-sm font-bold transition",
                        selectedOrder.status === status
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-rose-100 bg-white text-slate-700 hover:border-rose-300",
                      )}
                    >
                      {statusMeta[status].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                <PlanPanel order={selectedOrder} />
                <AssetsPanel order={selectedOrder} onPatchAsset={patchAsset} />
              </div>
            </section>
          ) : (
            <section className="rf-panel rounded-[8px] p-8 text-center">
              <h2 className="text-2xl font-black text-slate-950">Заказов пока нет</h2>
              <p className="mt-3 text-slate-600">Создай первый бриф, чтобы заполнить production board.</p>
            </section>
          )}
        </div>
      </div>
    </main>
    </ProtectedRoute>
    </Suspense>
  );
}

function PlanPanel({ order }: { order: Order }) {
  return (
    <article className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="rf-kicker text-blue-700">Creative brain</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">План креативов</h3>
        </div>
        <span className="rounded-md bg-blue-50 px-3 py-2 font-mono text-xs font-semibold text-blue-700">
          {styleLabels[order.brief.style]}
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-slate-950">Углы</h4>
          <ul className="mt-2 space-y-2">
            {order.plan.angles.slice(0, 4).map((angle) => (
              <li key={angle} className="rounded-md bg-rose-50 px-3 py-2 text-sm leading-6 text-slate-700">
                {angle}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-950">Хуки</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {order.plan.hooks.slice(0, 5).map((hook) => (
              <span key={hook} className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-950">
                {hook}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function AssetsPanel({
  order,
  onPatchAsset,
}: {
  order: Order;
  onPatchAsset: (orderId: string, asset: CreativeAsset, field: "videoUrl" | "thumbnailUrl", value: string) => void;
}) {
  return (
    <article className="rounded-[8px] border border-rose-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="rf-kicker text-rose-700">Assets</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Ролики и ссылки</h3>
        </div>
        <UploadCloud className="text-rose-600" size={22} aria-hidden="true" />
      </div>
      <div className="space-y-4">
        {order.assets.map((asset) => (
          <div key={asset.id} className="rounded-md border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="font-bold text-slate-950">{asset.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {asset.platform} · {asset.status}
                </p>
              </div>
              {asset.videoUrl ? (
                <a
                  href={asset.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rf-focus inline-flex min-h-10 items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-bold text-white"
                >
                  Открыть
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                  <Link2 size={13} aria-hidden="true" />
                  video URL
                </span>
                <input
                  className="input min-h-11 text-sm"
                  value={asset.videoUrl || ""}
                  onChange={(event) => onPatchAsset(order.id, asset, "videoUrl", event.target.value)}
                  placeholder="https://..."
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                  <Link2 size={13} aria-hidden="true" />
                  thumbnail URL
                </span>
                <input
                  className="input min-h-11 text-sm"
                  value={asset.thumbnailUrl?.startsWith("http") ? asset.thumbnailUrl : ""}
                  onChange={(event) => onPatchAsset(order.id, asset, "thumbnailUrl", event.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
