"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Settings,
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
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
      default_view: "grid" | "list";
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
  const { setTheme } = useTheme();
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

  const handleThemeChange = (theme: "light" | "dark") => {
    setTheme(theme);
    startTransition(async () => {
      try {
        await updatePreferences({ theme });
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

  const handleViewChange = (view: "grid" | "list") => {
    startTransition(async () => {
      try {
        await updatePreferences({ default_view: view });
        toast.success(tCommon("save"));
      } catch {
        toast.error("Error");
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

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
        </div>

        {/* Theme Section */}
        <SettingsSection icon={Sun} title={t("theme")}>
          <div className="flex gap-3">
            <OptionButton
              active={profile.preferences.theme === "light"}
              onClick={() => handleThemeChange("light")}
              icon={Sun}
              label={t("themeLight")}
            />
            <OptionButton
              active={profile.preferences.theme === "dark"}
              onClick={() => handleThemeChange("dark")}
              icon={Moon}
              label={t("themeDark")}
            />
          </div>
        </SettingsSection>

        <Separator className="opacity-50" />

        {/* Language Section */}
        <SettingsSection icon={Globe} title={t("language")}>
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
        </SettingsSection>

        <Separator className="opacity-50" />

        {/* Default View Section */}
        <SettingsSection icon={LayoutGrid} title={t("defaultView")}>
          <div className="flex gap-3">
            <OptionButton
              active={profile.preferences.default_view === "grid"}
              onClick={() => handleViewChange("grid")}
              icon={LayoutGrid}
              label="Grid"
            />
            <OptionButton
              active={profile.preferences.default_view === "list"}
              onClick={() => handleViewChange("list")}
              icon={List}
              label="List"
            />
          </div>
        </SettingsSection>

        <Separator className="opacity-50" />

        {/* AI Model Section */}
        <SettingsSection icon={Bot} title={t("aiModel")}>
          <div className="grid grid-cols-2 gap-3">
            {AI_MODELS.map((model) => (
              <OptionButton
                key={model.value}
                active={profile.ai_selected_model === model.value}
                onClick={() => handleModelChange(model.value)}
                label={model.label}
              />
            ))}
          </div>
        </SettingsSection>

        <Separator className="opacity-50" />

        {/* API Keys Section */}
        <SettingsSection icon={Key} title={t("apiKeys")}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gemini-key">{t("geminiKey")}</Label>
              <div className="flex gap-2">
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder={
                    apiKeys.has_gemini
                      ? apiKeys.gemini_key
                      : "Enter Gemini API key..."
                  }
                  value={geminiKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGeminiKey(e.target.value)
                  }
                  className="glass-subtle"
                />
              </div>
              {apiKeys.has_gemini && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3 h-3 text-primary" />
                  Key saved
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tavily-key">{t("tavilyKey")}</Label>
              <div className="flex gap-2">
                <Input
                  id="tavily-key"
                  type="password"
                  placeholder={
                    apiKeys.has_tavily
                      ? apiKeys.tavily_key
                      : "Enter Tavily API key..."
                  }
                  value={tavilyKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTavilyKey(e.target.value)
                  }
                  className="glass-subtle"
                />
              </div>
              {apiKeys.has_tavily && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3 h-3 text-primary" />
                  Key saved
                </p>
              )}
            </div>

            <Button
              onClick={handleSaveKeys}
              disabled={isPending || (!geminiKey && !tavilyKey)}
              className="gradient-primary text-primary-foreground"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {tCommon("save")}
            </Button>
          </div>
        </SettingsSection>

        <Separator className="opacity-50" />

        {/* Profile Section */}
        <SettingsSection icon={User} title={t("profile")}>
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
              className="gradient-primary text-primary-foreground"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {tCommon("save")}
            </Button>
          </div>
        </SettingsSection>

        <Separator className="opacity-50" />

        {/* Danger Zone */}
        <div className="glass rounded-xl p-6 border-destructive/20">
          <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            {t("deleteAccount")}
          </h3>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
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
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h3>
      {children}
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
        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background/50 text-muted-foreground hover:text-foreground hover:border-foreground/20",
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {active && <Check className="w-3.5 h-3.5 ml-auto" />}
    </button>
  );
}
