"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="kf-final-cta" aria-labelledby="final-cta-title">
      <div className="kf-band-inner">
        <motion.h2
          id="final-cta-title"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          Готовы показать свой продукт?
        </motion.h2>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button asChild className="kf-final-cta-button">
            <Link href="/brief">
              Получить первые идеи
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
