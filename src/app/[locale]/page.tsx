import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import {
  BookOpen,
  BarChart3,
  Bot,
  Sparkles,
  Search,
  Shield,
} from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LandingContent />;
}

function LandingContent() {
  const t = useTranslations();

  const features = [
    { icon: BookOpen, key: "media" as const },
    { icon: Sparkles, key: "collections" as const },
    { icon: Bot, key: "ai" as const },
    { icon: BarChart3, key: "analytics" as const },
    { icon: Search, key: "search" as const },
    { icon: Shield, key: "privacy" as const },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/8 blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="glass rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-gradient">{t("landing.hero.title")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("landing.hero.subtitle")}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-lg transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            {t("landing.hero.cta")}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            {t("landing.features.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="glass rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg group"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t(`landing.features.${key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(`landing.features.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
