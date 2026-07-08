"use client";

import { seedOrders } from "./seed";
import type { CreativeAsset, Order, OrderStatus } from "./types";

export const STORAGE_KEY = "reelsfactory.orders.v1";

function cloneSeedOrders(): Order[] {
  return JSON.parse(JSON.stringify(seedOrders)) as Order[];
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") {
    return cloneSeedOrders();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = cloneSeedOrders();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : cloneSeedOrders();
  } catch {
    return cloneSeedOrders();
  }
}

export function saveOrders(orders: Order[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("reelsfactory:orders"));
}

export function subscribeOrders(listener: () => void) {
  window.addEventListener("reelsfactory:orders", listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener("reelsfactory:orders", listener);
    window.removeEventListener("storage", listener);
  };
}

export function getOrdersSnapshot() {
  return JSON.stringify(getOrders());
}

export function getServerOrdersSnapshot() {
  return "[]";
}

export function upsertOrder(order: Order) {
  const orders = getOrders();
  const existingIndex = orders.findIndex((item) => item.id === order.id);
  const next =
    existingIndex >= 0
      ? orders.map((item, index) => (index === existingIndex ? order : item))
      : [order, ...orders];
  saveOrders(next);
  return order;
}

export function findOrder(orderId: string) {
  return getOrders().find((order) => order.id === orderId);
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const next = getOrders().map((order) => (order.id === orderId ? { ...order, status } : order));
  saveOrders(next);
}

export function updateAsset(orderId: string, assetId: string, patch: Partial<CreativeAsset>) {
  const next = getOrders().map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    return {
      ...order,
      assets: order.assets.map((asset) =>
        asset.id === assetId ? { ...asset, ...patch } : asset,
      ),
    };
  });
  saveOrders(next);
}
