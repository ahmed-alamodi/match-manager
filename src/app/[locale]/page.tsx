"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, User, Trophy, CreditCard, ClipboardCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const features = [
    { icon: Trophy, label: t("nav.matches"), color: "text-blue-500" },
    { icon: CreditCard, label: t("nav.payments"), color: "text-emerald-500" },
    { icon: ClipboardCheck, label: t("nav.attendance"), color: "text-amber-500" },
  ];

  return (
    <div className="min-h-screen relative z-10 flex flex-col">
      {/* Top bar */}
      <div className="absolute top-4 end-4 z-50 flex items-center gap-2">
        <select
          value={locale}
          onChange={(e) => router.push(`/${e.target.value}`)}
          className="p-1.5 rounded-xl bg-transparent border border-border text-xs cursor-pointer outline-none"
        >
          <option value="ar">{t("common.arabic")}</option>
          <option value="en">{t("common.english")}</option>
        </select>
        <ThemeToggle />
      </div>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 md:p-12 max-w-lg w-full text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Image
              src="/logo.png"
              alt="Match Manager"
              width={80}
              height={80}
              className="mx-auto mb-6 rounded-2xl shadow-lg"
            />
          </motion.div>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-500 to-emerald-300 bg-clip-text text-transparent">
            {t("app.name")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t("app.description")}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {features.map((feat, i) => (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/50 text-xs font-medium"
              >
                <feat.icon className={`w-3.5 h-3.5 ${feat.color}`} />
                {feat.label}
              </motion.div>
            ))}
          </div>

          {/* Login buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push(`/${locale}/login`)}
              className="w-full rounded-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Shield className="w-5 h-5" />
              {t("auth.adminLogin")}
              <ArrowRight className="w-4 h-4 ms-auto" />
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/player-login`)}
              className="w-full rounded-full h-12 text-base font-semibold border-border/50 hover:bg-accent cursor-pointer"
            >
              <User className="w-5 h-5" />
              {t("auth.playerLogin")}
              <ArrowRight className="w-4 h-4 ms-auto" />
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
