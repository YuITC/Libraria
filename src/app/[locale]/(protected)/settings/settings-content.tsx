"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  Globe,
  Bot,
  Key,
  User,
  Trash2,
  Save,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  updateProfile,
  updatePreferences,
  updateAIModel,
  saveAPIKeys,
  deleteAccount,
} from "@/actions/profile";
import { AI_MODELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SettingsContentProps {
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    preferences: {
      theme: "light" | "dark";
      language: "en" | "vi";
      // default_view: "grid" | "list"; // Removed as per request
    };
    ai_selected_model: string;
  };
  apiKeys: {
    gemini_key: string;
    tavily_key: string;
    has_gemini?: boolean;
    has_tavily?: boolean;
  };
  locale: string;
}

export function SettingsContent({
  profile,
  apiKeys,
  locale,
}: SettingsContentProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Profile state
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");

  // API keys state
  const [geminiKey, setGeminiKey] = useState("");
  const [tavilyKey, setTavilyKey] = useState("");

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Mount state for theme hydration mismatch prevention
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    // Sync with server only if user is logged in (implied by this page)
    startTransition(async () => {
      try {
        await updatePreferences({ theme: newTheme });
      } catch {
        toast.error(t("theme") + ": Error");
      }
    });
  };

  const handleLanguageChange = (language: "en" | "vi") => {
    startTransition(async () => {
      try {
        await updatePreferences({ language });
        router.push(`/${language}/settings`);
      } catch {
        toast.error(t("language") + ": Error");
      }
    });
  };

  const handleModelChange = (model: string) => {
    startTransition(async () => {
      try {
        await updateAIModel(model);
        toast.success(tCommon("save"));
      } catch {
        toast.error("Error");
      }
    });
  };

  const handleSaveProfile = () => {
    startTransition(async () => {
      try {
        await updateProfile({
          display_name: displayName,
          avatar_url: avatarUrl,
        });
        toast.success(tCommon("save"));
      } catch {
        toast.error("Error");
      }
    });
  };

  const handleSaveKeys = () => {
    if (!geminiKey && !tavilyKey) return;
    startTransition(async () => {
      try {
        await saveAPIKeys({
          ...(geminiKey ? { gemini_key: geminiKey } : {}),
          ...(tavilyKey ? { tavily_key: tavilyKey } : {}),
        });
        setGeminiKey("");
        setTavilyKey("");
        toast.success(t("keySaved"));
        router.refresh();
      } catch {
        toast.error("Error");
      }
    });
  };

  const handleDeleteAccount = () => {
    startTransition(async () => {
      try {
        await deleteAccount();
        window.location.href = `/${locale}/login`;
      } catch {
        toast.error("Error");
      }
    });
  };

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Group 1: Appearance (Theme - Language) */}
      <h2 className="text-xl font-semibold mb-4 text-foreground/80">
        Appearance
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Section */}
        <SettingsCard icon={Sun} title={t("theme")}>
          <div className="flex gap-3">
            <OptionButton
              active={theme === "light"}
              onClick={() => handleThemeChange("light")}
              icon={Sun}
              label={t("themeLight")}
            />
            <OptionButton
              active={theme === "dark"}
              onClick={() => handleThemeChange("dark")}
              icon={Moon}
              label={t("themeDark")}
            />
          </div>
        </SettingsCard>

        {/* Language Section */}
        <SettingsCard icon={Globe} title={t("language")}>
          <div className="flex gap-3">
            <OptionButton
              active={locale === "en"}
              onClick={() => handleLanguageChange("en")}
              label={t("langEn")}
            />
            <OptionButton
              active={locale === "vi"}
              onClick={() => handleLanguageChange("vi")}
              label={t("langVi")}
            />
          </div>
        </SettingsCard>
      </div>

      {/* Group 2: Intelligence (AI Model - API Keys) */}
      <h2 className="text-xl font-semibold mb-4 pt-4 text-foreground/80">
        Intelligence
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Model Section */}
        <SettingsCard icon={Bot} title={t("aiModel")}>
          <div className="grid grid-cols-1 gap-3">
            {AI_MODELS.map((model) => (
              <OptionButton
                key={model.value}
                active={profile.ai_selected_model === model.value}
                onClick={() => handleModelChange(model.value)}
                label={model.label}
              />
            ))}
          </div>
        </SettingsCard>

        {/* API Keys Section */}
        <SettingsCard icon={Key} title={t("apiKeys")}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gemini-key">{t("geminiKey")}</Label>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder={
                    apiKeys.has_gemini
                      ? "••••••••••••••••"
                      : "Enter Gemini API key..."
                  }
                  value={geminiKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGeminiKey(e.target.value)
                  }
                  className="glass-subtle pr-8"
                />
                {apiKeys.has_gemini && (
                  <div className="absolute right-2 top-2.5 text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tavily-key">{t("tavilyKey")}</Label>
              <div className="relative">
                <Input
                  id="tavily-key"
                  type="password"
                  placeholder={
                    apiKeys.has_tavily
                      ? "••••••••••••••••"
                      : "Enter Tavily API key..."
                  }
                  value={tavilyKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTavilyKey(e.target.value)
                  }
                  className="glass-subtle pr-8"
                />
                {apiKeys.has_tavily && (
                  <div className="absolute right-2 top-2.5 text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleSaveKeys}
              disabled={isPending || (!geminiKey && !tavilyKey)}
              className="w-full gradient-primary text-primary-foreground"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {tCommon("save")}
            </Button>
          </div>
        </SettingsCard>
      </div>

      {/* Group 3: Account (Profile - Logout - Delete) */}
      <h2 className="text-xl font-semibold mb-4 pt-4 text-foreground/80">
        Account
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Section */}
        <SettingsCard icon={User} title={t("profile")}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">{t("displayName")}</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDisplayName(e.target.value)
                }
                className="glass-subtle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar-url">{t("avatar")}</Label>
              <Input
                id="avatar-url"
                value={avatarUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAvatarUrl(e.target.value)
                }
                placeholder="https://..."
                className="glass-subtle"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isPending}
              className="w-full gradient-primary text-primary-foreground"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {tCommon("save")}
            </Button>
          </div>
        </SettingsCard>

        {/* Danger Section */}
        <SettingsCard
          icon={Trash2}
          title="Danger Zone"
          className="border-destructive/20"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <div className="mt-auto">
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t("deleteAccount")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-strong">
                  <DialogHeader>
                    <DialogTitle>{tConfirm("title")}</DialogTitle>
                    <DialogDescription>{t("deleteConfirm")}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteOpen(false)}
                    >
                      {tConfirm("cancel")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isPending}
                    >
                      {isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {tConfirm("delete")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function SettingsCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-xl p-6 h-full flex flex-col", className)}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h3>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all border w-full justify-center",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background/50 text-muted-foreground hover:text-foreground hover:border-foreground/20",
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {active && <Check className="w-3.5 h-3.5 ml-1" />}
    </button>
  );
}
