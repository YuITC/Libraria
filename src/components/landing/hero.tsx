"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 pt-20 text-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 animate-pulse" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-4xl mx-auto space-y-8"
      >
        <Badge
          variant="secondary"
          className="px-4 py-2 rounded-full text-sm backdrop-blur-sm border-primary/20 bg-background/50"
        >
          <Sparkles className="w-4 h-4 mr-2 text-primary" />
          {t("badge")}
        </Badge>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-accent animate-gradient bg-300%">
            {t("title")}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          {t("subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-lg rounded-full group"
            asChild
          >
            <Link href="/login">
              {t("cta")}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto h-12 px-8 text-lg rounded-full backdrop-blur-sm bg-background/50"
            asChild
          >
            <Link href="#features">{t("secondaryCta")}</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
