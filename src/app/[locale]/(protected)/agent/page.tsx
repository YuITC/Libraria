import { setRequestLocale } from "next-intl/server";
import { AgentContent } from "./agent-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AgentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AgentContent />;
}
