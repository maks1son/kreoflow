export type OrderStatus =
  | "new"
  | "strategy"
  | "production"
  | "review"
  | "delivered";

export type Niche = "beauty" | "fitness";
export type Goal = "leads" | "sales" | "awareness" | "content";
export type Style = "premium" | "friendly" | "bold" | "expert";
export type Platform = "Reels" | "Shorts" | "VK Clips";

export type BriefInput = {
  businessName: string;
  niche: Niche;
  websiteUrl?: string;
  socialUrl?: string;
  offer: string;
  audience: string;
  goal: Goal;
  style: Style;
  contactName: string;
  contactMethod: string;
};

export type CreativePlan = {
  angles: string[];
  hooks: string[];
  scripts: {
    title: string;
    format: "ugc" | "expert" | "before_after" | "offer";
    durationSec: 15 | 20 | 30;
    script: string;
    caption: string;
  }[];
  contentCalendar: {
    day: string;
    idea: string;
    platform: Platform;
  }[];
};

export type CreativeAsset = {
  id: string;
  orderId: string;
  title: string;
  angle: string;
  platform: Platform;
  videoUrl?: string;
  thumbnailUrl?: string;
  caption: string;
  status: "planned" | "uploaded" | "approved";
};

export type Order = {
  id: string;
  status: OrderStatus;
  brief: BriefInput;
  plan: CreativePlan;
  assets: CreativeAsset[];
  createdAt: string;
};

export type StatusMeta = {
  label: string;
  shortLabel: string;
  description: string;
};
