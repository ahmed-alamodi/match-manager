"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { StatCard } from "@/components/shared/stat-card";
import { Users, TrendingUp, CreditCard, AlertCircle, Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import Link from "next/link";

// Demo data for dashboard
const DEMO_STATS = {
  totalPlayers: 35,
  attendanceRate: 78,
  monthlyRevenue: 2800,
  pendingPayments: 7,
};

const DEMO_TOP_PLAYERS = [
  { name: "Ahmed Al-Amodi", attendance: 95, jersey: 1 },
  { name: "Mohammed Saleh", attendance: 92, jersey: 2 },
  { name: "Khaled Ibrahim", attendance: 90, jersey: 3 },
  { name: "Omar Hassan", attendance: 88, jersey: 4 },
  { name: "Yusuf Nasser", attendance: 85, jersey: 5 },
];

const DEMO_RECENT_MATCHES = [
  { opponent: "Al-Hilal FC", date: "2026-04-25", status: "upcoming" as const },
  { opponent: "Al-Ahli United", date: "2026-05-02", status: "upcoming" as const },
  { opponent: "Al-Ittihad FC", date: "2026-04-11", status: "completed" as const },
];

export default function AdminDashboardPage() {
  const t = useTranslations("dashboard");
  const tMatches = useTranslations("matches");
  const locale = useLocale();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="font-heading text-2xl sm:text-3xl font-bold"
      >
        {t("title")}
      </motion.h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label={t("totalPlayers")}
          value={DEMO_STATS.totalPlayers}
          icon={Users}
          delay={0.05}
        />
        <StatCard
          label={t("attendanceRate")}
          value={`${DEMO_STATS.attendanceRate}%`}
          icon={TrendingUp}
          variant="info"
          delay={0.1}
        />
        <StatCard
          label={t("monthlyRevenue")}
          value={`${DEMO_STATS.monthlyRevenue.toLocaleString()} SAR`}
          icon={CreditCard}
          delay={0.15}
        />
        <StatCard
          label={t("pendingPayments")}
          value={DEMO_STATS.pendingPayments}
          icon={AlertCircle}
          variant="warning"
          delay={0.2}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-500" />
              {t("recentMatches")}
            </h2>
            <Link href={`/${locale}/admin/matches`}>
              <Button variant="ghost" size="sm" className="text-xs cursor-pointer">
                {t("viewAll")} →
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {DEMO_RECENT_MATCHES.map((match, i) => (
              <motion.div
                key={match.opponent}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${match.status === "upcoming" ? "bg-blue-500" : "bg-gray-400"}`} />
                  <div>
                    <p className="font-medium text-sm">{tMatches("vs")} {match.opponent}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(match.date + "T00:00:00").toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  match.status === "upcoming"
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-gray-500/10 text-gray-500"
                }`}>
                  {match.status === "upcoming" ? tMatches("upcoming") : tMatches("completed")}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Players */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold flex items-center gap-2">
              ⭐ {t("topPlayers")}
            </h2>
            <Link href={`/${locale}/admin/players`}>
              <Button variant="ghost" size="sm" className="text-xs cursor-pointer">
                {t("viewAll")} →
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {DEMO_TOP_PLAYERS.map((player, i) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="jersey-number text-xs w-8 h-8">{player.jersey}</span>
                  <span className="font-medium text-sm">{player.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-accent overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                      style={{ width: `${player.attendance}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-emerald-500 font-semibold">
                    {player.attendance}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 sm:p-6"
      >
        <h2 className="font-heading text-lg font-bold mb-4">{t("quickActions")}</h2>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/admin/matches`}>
            <Button className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 cursor-pointer">
              <Plus className="w-4 h-4" />
              {t("addMatch")}
            </Button>
          </Link>
          <Link href={`/${locale}/admin/players`}>
            <Button className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer">
              <Plus className="w-4 h-4" />
              {t("addPlayer")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
