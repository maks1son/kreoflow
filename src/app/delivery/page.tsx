import { Suspense } from "react";
import { DeliveryQueryClient } from "./delivery-client";

export default function DeliveryPage() {
  return (
    <Suspense fallback={null}>
      <DeliveryQueryClient />
    </Suspense>
  );
}
