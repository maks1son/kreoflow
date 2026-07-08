import { DeliveryClient } from "../delivery-client";
import { seedOrders } from "@/lib/seed";

export function generateStaticParams() {
  return seedOrders.map((order) => ({ orderId: order.id }));
}

export default async function DeliverySeedPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <DeliveryClient orderId={orderId} />;
}
