import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDecryptedAPIKeys } from "@/actions/profile";
import { SettingsContent } from "./settings-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const apiKeys = await getDecryptedAPIKeys();

  return (
    <SettingsContent profile={profile!} apiKeys={apiKeys} locale={locale} />
  );
}
