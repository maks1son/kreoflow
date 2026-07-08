import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Goal, OrderStatus, StatusMeta, Style } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statusMeta: Record<OrderStatus, StatusMeta> = {
  new: {
    label: "Новый бриф",
    shortLabel: "Бриф",
    description: "Клиент заполнил вводные, заказ ждет разбор.",
  },
  strategy: {
    label: "Сценарии",
    shortLabel: "Стратегия",
    description: "Собираем углы, хуки, сценарии и контент-план.",
  },
  production: {
    label: "Производство",
    shortLabel: "Продакшн",
    description: "Генерируем и собираем ролики под площадки.",
  },
  review: {
    label: "Проверка",
    shortLabel: "QC",
    description: "Смотрим качество, подписи, ритм и CTA.",
  },
  delivered: {
    label: "Выдано",
    shortLabel: "Готово",
    description: "Клиент получил галерею и материалы для публикации.",
  },
};

export const orderedStatuses: OrderStatus[] = [
  "new",
  "strategy",
  "production",
  "review",
  "delivered",
];

export const goalLabels: Record<Goal, string> = {
  leads: "Заявки",
  sales: "Продажи",
  awareness: "Узнаваемость",
  content: "Контент",
};

export const styleLabels: Record<Style, string> = {
  premium: "Премиально",
  friendly: "Дружелюбно",
  bold: "Смело",
  expert: "Экспертно",
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getStatusIndex(status: OrderStatus) {
  return orderedStatuses.indexOf(status);
}
