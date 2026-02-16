"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Library,
  Lock,
  Search,
  Sparkles,
  Tags,
} from "lucide-react";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeaturesGrid() {
  const t = useTranslations("landing.features");

  return (
    <section
      id="features"
      className="py-24 px-4 sm:px-6 lg:px-8 relative bg-secondary/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4 w-fit mx-auto leading-tight pb-1">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("smartOrg.description")}
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]"
        >
          {/* Large Card: Smart Organization */}
          <motion.div
            variants={item}
            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 md:col-span-2 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Library className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">
                  {t("smartOrg.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("smartOrg.description")}
                </p>
              </div>

              {/* Abstract Visual for Organization */}
              <div className="mt-4 flex gap-2 flex-wrap">
                {["Sci-Fi", "Favorites", "To Read", "2024"].map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground flex items-center gap-1 border border-border/50"
                  >
                    <Tags className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Privacy First */}
          <motion.div
            variants={item}
            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 text-accent">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                {t("privacy.title")}
              </h3>
              <p className="text-muted-foreground mb-8">
                {t("privacy.description")}
              </p>
            </div>
          </motion.div>

          {/* Medium Card: AI Analysis */}
          <motion.div
            variants={item}
            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-500">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("aiAnalysis.title")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("aiAnalysis.description")}
              </p>
            </div>
          </motion.div>

          {/* Medium Card: Universal Search */}
          <motion.div
            variants={item}
            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/50 backdrop-blur-sm p-8 shadow-sm hover:shadow-md transition-all duration-300 md:col-span-2"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 h-full">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("search.title")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("search.description")}
                </p>
              </div>

              {/* Search Visual */}
              <div className="w-full md:w-1/2 bg-muted/40 rounded-xl p-4 border border-border/50 flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <div className="h-4 bg-muted w-3/4 rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
