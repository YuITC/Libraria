"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const t = useTranslations("landing.cta");

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
          {t("title")}
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>

        <Button
          size="lg"
          className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
          asChild
        >
          <Link href="/login">
            {t("button")}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
