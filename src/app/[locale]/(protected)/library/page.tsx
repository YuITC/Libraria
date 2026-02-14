import { setRequestLocale } from "next-intl/server";
import { LibraryContent } from "./library-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LibraryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LibraryContent />;
}
