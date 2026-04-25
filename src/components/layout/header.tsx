"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  subtitle?: string;
  showLock?: boolean;
  onLock?: () => void;
  isDemo?: boolean;
}

export function Header({ subtitle, showLock = true, onLock, isDemo = true }: HeaderProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Replace current locale prefix in the pathname
    const segments = pathname.split("/");
    if (segments[1] === "ar" || segments[1] === "en") {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join("/") || "/");
  };

  return (
    <header className="sticky top-0 z-50 px-4 py-3 bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Image
            src="/logo.png"
            alt="Logo"
            width={36}
            height={36}
            className="rounded-lg flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-base sm:text-lg font-bold leading-tight truncate">
              {t("app.name")}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {isDemo && (
            <Badge variant="outline" className="text-xs hidden sm:inline-flex text-amber-500 border-amber-500/30">
              {t("common.demoMode")}
            </Badge>
          )}

          {/* Language Selector */}
          <select
            value={locale}
            onChange={(e) => switchLocale(e.target.value)}
            className="p-1.5 sm:p-2 rounded-xl bg-transparent border border-border text-xs sm:text-sm min-w-[70px] sm:min-w-[80px] cursor-pointer outline-none transition-colors hover:bg-accent"
          >
            <option value="ar">{t("common.arabic")}</option>
            <option value="en">{t("common.english")}</option>
          </select>

          <ThemeToggle />

          {showLock && onLock && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLock}
              className="rounded-xl text-muted-foreground cursor-pointer"
              aria-label="Lock dashboard"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
