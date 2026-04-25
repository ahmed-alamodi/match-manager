"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Trophy,
  ClipboardCheck,
} from "lucide-react";

const navItems = [
  { id: "dashboard", href: "/admin", icon: LayoutDashboard },
  { id: "players", href: "/admin/players", icon: Users },
  { id: "payments", href: "/admin/payments", icon: CreditCard },
  { id: "matches", href: "/admin/matches", icon: Trophy },
  { id: "attendance", href: "/admin/attendance", icon: ClipboardCheck },
] as const;

export function Sidebar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-57px)] border-e border-border/50 bg-card/30 backdrop-blur-sm">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive =
            item.href === "/admin"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{t(item.id)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 px-2 py-2 safe-area-bottom">
      <div className="flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive =
            item.href === "/admin"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span className="truncate">{t(item.id)}</span>
              {isActive && (
                <div className="absolute -bottom-0 w-12 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
