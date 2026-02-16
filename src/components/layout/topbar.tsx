"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  BookOpen,
  BarChart3,
  Bot,
  Settings,
  Menu,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface TopbarProps {
  user: {
    email?: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
  locale: string;
}

const NAV_ITEMS = [
  { href: "/library", icon: BookOpen, labelKey: "library" as const },
  { href: "/dashboard", icon: BarChart3, labelKey: "dashboard" as const },
  { href: "/agent", icon: Bot, labelKey: "librarian" as const },
  { href: "/settings", icon: Settings, labelKey: "settings" as const },
];

export function Topbar({ user, locale }: TopbarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}/login`;
  };

  const initials =
    user.display_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link
            href={`/${locale}/library`}
            className="flex items-center gap-2 font-bold text-lg transition-opacity hover:opacity-80"
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline text-gradient">Libraria</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
              const fullHref = `/${locale}${href}`;
              const isActive =
                pathname === fullHref || pathname.startsWith(fullHref + "/");

              return (
                <Link
                  key={href}
                  href={fullHref}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t(labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Right side: theme toggle + user menu */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newTheme = theme === "dark" ? "light" : "dark";
                  setTheme(newTheme);
                  // Sync with server if user is logged in
                  // We can't easily check auth here without proper context or prop drilling
                  // But since Topbar is mostly used in protected routes, we can try to update
                  // If it fails (not logged in), it's fine as client auth handles redirection
                  import("@/actions/profile").then(({ updatePreferences }) => {
                    updatePreferences({ theme: newTheme }).catch(() => {
                      // Silent fail if not logged in or error
                    });
                  });
                }}
                className="rounded-lg"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* User Menu (Desktop) */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.avatar_url || undefined}
                        alt={user.display_name || ""}
                      />
                      <AvatarFallback className="text-xs gradient-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.display_name && (
                        <p className="font-medium text-sm">
                          {user.display_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${locale}/settings`}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {t("settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <Menu className="w-5 h-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 glass-strong p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col h-full">
                    {/* Mobile User Info */}
                    <div className="flex items-center gap-3 p-4 border-b border-border/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.avatar_url || undefined}
                          alt={user.display_name || ""}
                        />
                        <AvatarFallback className="text-sm gradient-primary text-primary-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        {user.display_name && (
                          <p className="font-medium text-sm">
                            {user.display_name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Nav Links */}
                    <nav className="flex-1 p-2">
                      {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
                        const fullHref = `/${locale}${href}`;
                        const isActive =
                          pathname === fullHref ||
                          pathname.startsWith(fullHref + "/");

                        return (
                          <Link
                            key={href}
                            href={fullHref}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            {t(labelKey)}
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Mobile Sign Out */}
                    <div className="p-2 border-t border-border/50">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
