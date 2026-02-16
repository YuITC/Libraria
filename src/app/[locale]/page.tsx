import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LandingContent />;
}

import { Hero } from "@/components/landing/hero";
import { FeaturesGrid } from "@/components/landing/features-grid";

import { CtaSection } from "@/components/landing/cta-section";

function LandingContent() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <Hero />

      <FeaturesGrid />
      <CtaSection />
    </main>
  );
}
