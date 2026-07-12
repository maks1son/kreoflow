import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="kf-final-cta" aria-labelledby="final-cta-title">
      <div className="kf-band-inner">
        <h2 id="final-cta-title">Покажем ваш продукт?</h2>
        <div>
          <Button asChild className="kf-final-cta-button">
            <Link href="/brief" prefetch={false}>
              Попробовать от 590 ₽
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
