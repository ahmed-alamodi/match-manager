"use client";

import { Header } from "@/components/layout/header";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/queries/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("app");
  const { signOut } = useAuth();

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <Header subtitle={t("adminDashboard")} showLock={true} onLock={() => signOut.mutate()} isDemo={false} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
