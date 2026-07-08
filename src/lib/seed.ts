import { createAssetsFromPlan, generateCreativePlan } from "./generator";
import type { BriefInput, Order } from "./types";

const beautyBrief: BriefInput = {
  businessName: "Luma Skin Studio",
  niche: "beauty",
  websiteUrl: "https://example.com/luma",
  socialUrl: "https://instagram.com/luma",
  offer: "первичная консультация косметолога и уход сияние",
  audience: "женщины 25-40, которые хотят выглядеть свежее без агрессивных процедур",
  goal: "leads",
  style: "premium",
  contactName: "Анна",
  contactMethod: "@luma_manager",
};

const fitnessBrief: BriefInput = {
  businessName: "Pulse Fit Club",
  niche: "fitness",
  websiteUrl: "https://example.com/pulse",
  socialUrl: "https://vk.com/pulsefit",
  offer: "7-дневный старт с тренером и планом питания",
  audience: "люди, которые давно хотят вернуться в форму, но срываются после первой недели",
  goal: "sales",
  style: "bold",
  contactName: "Илья",
  contactMethod: "+7 900 000-00-00",
};

function buildSeedOrder(id: string, brief: BriefInput, status: Order["status"]): Order {
  const plan = generateCreativePlan(brief);
  return {
    id,
    status,
    brief,
    plan,
    assets: createAssetsFromPlan(id, plan).map((asset, index) => ({
      ...asset,
      status: index < 2 ? "uploaded" : asset.status,
      thumbnailUrl: index < 2 ? (index === 0 ? "gradient-rose" : "gradient-blue") : asset.thumbnailUrl,
    })),
    createdAt: new Date(Date.now() - (status === "review" ? 1000 * 60 * 60 * 18 : 1000 * 60 * 60 * 44)).toISOString(),
  };
}

export const seedOrders: Order[] = [
  buildSeedOrder("rf-demo-beauty", beautyBrief, "review"),
  buildSeedOrder("rf-demo-fitness", fitnessBrief, "production"),
];
