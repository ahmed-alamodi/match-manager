"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Check, X } from "lucide-react";
import { toast } from "sonner";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEAR = new Date().getFullYear();

const DEMO_MATCHES = [
  { id: 1, date: "2026-04-25", time: "20:00", location: "Al-Marsad Stadium", opponent: "Al-Hilal FC", status: "upcoming" },
  { id: 2, date: "2026-05-02", time: "21:00", location: "Green Field Arena", opponent: "Al-Ahli United", status: "upcoming" },
  { id: 3, date: "2026-05-10", time: "19:30", location: "City Sports Complex", opponent: "Al-Shabab Stars", status: "upcoming" },
];

const positionClasses: Record<string, string> = {
  Goalkeeper: "position-gk",
  Defender: "position-def",
  Midfielder: "position-mid",
  Forward: "position-fwd",
};

export default function PlayerPortalPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [player, setPlayer] = useState<{ id: number; name: string; accessCode: string } | null>(null);

  // Full player info (simulated)
  const playerInfo = useMemo(() => {
    if (!player) return null;
    return {
      ...player,
      jerseyNumber: player.id,
      position: (["Goalkeeper", "Defender", "Defender", "Defender", "Defender",
        "Midfielder", "Midfielder", "Midfielder", "Midfielder", "Midfielder",
        "Forward", "Forward", "Forward", "Goalkeeper", "Defender"] as const)[Math.min(player.id - 1, 14)],
      phone: `+966 500 ${String(player.id).padStart(4, "0")}`,
    };
  }, [player]);

  // Random payments
  const payments = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return MONTHS.map((_, i) => {
      if (i > currentMonth) return "future";
      return Math.random() < 0.7 ? "paid" : "unpaid";
    });
  }, []);

  // Attendance statuses
  const [rsvp, setRsvp] = useState<Record<number, "confirmed" | "declined" | "pending">>({});

  useEffect(() => {
    const saved = sessionStorage.getItem("player-session");
    if (saved) {
      setPlayer(JSON.parse(saved));
      // Init random RSVP
      const initial: Record<number, "confirmed" | "declined" | "pending"> = {};
      DEMO_MATCHES.forEach((m) => {
        const rand = Math.random();
        if (rand < 0.3) initial[m.id] = "confirmed";
        else if (rand < 0.5) initial[m.id] = "declined";
        else initial[m.id] = "pending";
      });
      setRsvp(initial);
    } else {
      router.push(`/${locale}/player-login`);
    }
  }, [locale, router]);

  const handleRSVP = (matchId: number, status: "confirmed" | "declined") => {
    setRsvp((prev) => ({ ...prev, [matchId]: status }));
    toast.success(
      status === "confirmed"
        ? t("attendance.attendanceConfirmed")
        : t("attendance.markedDeclined")
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem("player-session");
    router.push(`/${locale}/player-login`);
  };

  if (!player || !playerInfo) return null;

  const currentMonth = new Date().getMonth();
  const monthsPaid = payments.filter((p) => p === "paid").length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative z-10 min-h-screen">
      <Header
        subtitle={`${t("player.welcome")}, ${player.name.split(" ")[0]}`}
        onLock={handleLogout}
        isDemo
      />

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 mb-6"
        >
          <div className="flex items-center gap-4">
            <span className="jersey-number text-xl w-14 h-14">{playerInfo.jerseyNumber}</span>
            <div>
              <h2 className="font-heading text-xl font-bold">{player.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${positionClasses[playerInfo.position]}`}>
                {playerInfo.position}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Payment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-6"
        >
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
            💰 {t("payments.paymentStatus")}
            <span className="text-sm font-normal text-muted-foreground">({YEAR})</span>
          </h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {MONTHS.map((month, i) => {
              const status = payments[i];
              return (
                <div key={i} className="text-center">
                  <div className={`payment-dot mx-auto mb-1 ${status}`}>
                    {status === "future" ? "—" : status === "paid" ? "✓" : "✗"}
                  </div>
                  <p className="text-[0.6rem] text-muted-foreground font-medium">{month}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("payments.monthsPaid")}</span>
            <span className="font-mono font-bold text-emerald-500">
              {monthsPaid} / {currentMonth + 1}
            </span>
          </div>
        </motion.div>

        {/* Upcoming Matches + RSVP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
            ⚽ {t("player.upcomingMatches")}
          </h3>
          {DEMO_MATCHES.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground">
              <p>{t("player.noUpcoming")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {DEMO_MATCHES.map((match) => {
                const status = rsvp[match.id] || "pending";
                return (
                  <div key={match.id} className="glass-card p-5 ps-7 relative">
                    <div className="match-bar-upcoming" />
                    <div className="mb-3">
                      <h4 className="font-heading font-bold text-lg">
                        {t("matches.vs")} {match.opponent}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(match.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {match.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {match.location}
                        </span>
                      </div>
                    </div>

                    {/* RSVP */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {status === "confirmed" ? (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          ✓ {t("attendance.youreConfirmed")}
                        </span>
                      ) : status === "declined" ? (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                          ✗ {t("attendance.declined")}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          ⏳ {t("attendance.pendingResponse")}
                        </span>
                      )}
                      <div className="flex gap-2 ms-auto">
                        <Button
                          size="sm"
                          onClick={() => handleRSVP(match.id, "confirmed")}
                          disabled={status === "confirmed"}
                          className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-xs cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {t("attendance.confirm")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRSVP(match.id, "declined")}
                          disabled={status === "declined"}
                          className="rounded-full text-xs border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t("attendance.decline")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
