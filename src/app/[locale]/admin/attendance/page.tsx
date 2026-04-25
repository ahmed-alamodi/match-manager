"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { StatCard } from "@/components/shared/stat-card";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";

const DEMO_MATCHES = [
  { id: "1", date: "2026-04-25", time: "20:00", location: "Al-Marsad Stadium", opponent: "Al-Hilal FC", status: "upcoming" },
  { id: "2", date: "2026-05-02", time: "21:00", location: "Green Field Arena", opponent: "Al-Ahli United", status: "upcoming" },
  { id: "3", date: "2026-04-11", time: "20:00", location: "Al-Marsad Stadium", opponent: "Al-Ittihad FC", status: "completed" },
];

const DEMO_PLAYERS = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  name: [
    "Ahmed Al-Amodi", "Mohammed Saleh", "Khaled Ibrahim", "Omar Hassan", "Yusuf Nasser",
    "Fahad Qasim", "Ali Mansour", "Saad Al-Rashid", "Tariq Al-Dosari", "Nayef Bandar",
    "Sultan Al-Harbi", "Meshal Turki", "Waleed Faisal", "Hamza Al-Otaibi", "Rayan Majed",
    "Abdulaziz Nabil", "Feras Al-Zahrani", "Bader Al-Mutairi", "Nawaf Saeed", "Majid Al-Ghamdi",
  ][i],
  jerseyNumber: i + 1,
  position: (["Goalkeeper", "Defender", "Defender", "Defender", "Defender",
    "Midfielder", "Midfielder", "Midfielder", "Midfielder", "Midfielder",
    "Forward", "Forward", "Forward", "Goalkeeper", "Defender",
    "Defender", "Midfielder", "Midfielder", "Midfielder", "Forward"])[i],
}));

function generateAttendance(matchId: string) {
  return DEMO_PLAYERS.map((p) => {
    const rand = Math.random();
    let status: "confirmed" | "declined" | "pending";
    if (matchId === "3") {
      status = rand < 0.75 ? "confirmed" : "declined";
    } else {
      if (rand < 0.4) status = "confirmed";
      else if (rand < 0.55) status = "declined";
      else status = "pending";
    }
    return { playerId: p.id, status };
  });
}

const positionClasses: Record<string, string> = {
  Goalkeeper: "position-gk",
  Defender: "position-def",
  Midfielder: "position-mid",
  Forward: "position-fwd",
};

const statusStyles = {
  confirmed: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  declined: "bg-red-500/10 text-red-500 border border-red-500/20",
  pending: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
};

const statusIcons = {
  confirmed: "✓",
  declined: "✗",
  pending: "⏳",
};

export default function AttendancePage() {
  const t = useTranslations("attendance");
  const tPlayers = useTranslations("players");
  const [selectedMatch, setSelectedMatch] = useState("");
  const [attendanceData, setAttendanceData] = useState<Record<string, { playerId: string; status: "confirmed" | "declined" | "pending" }[]>>({});

  // Auto-select first upcoming match
  useEffect(() => {
    const upcoming = DEMO_MATCHES.find((m) => m.status === "upcoming");
    if (upcoming) setSelectedMatch(upcoming.id);
  }, []);

  // Load attendance when match changes
  useEffect(() => {
    if (selectedMatch && !attendanceData[selectedMatch]) {
      setAttendanceData((prev) => ({
        ...prev,
        [selectedMatch]: generateAttendance(selectedMatch),
      }));
    }
  }, [selectedMatch, attendanceData]);

  const attendance = attendanceData[selectedMatch] || [];

  const stats = useMemo(() => {
    const confirmed = attendance.filter((a) => a.status === "confirmed").length;
    const declined = attendance.filter((a) => a.status === "declined").length;
    const pending = attendance.filter((a) => a.status === "pending").length;
    return { confirmed, declined, pending };
  }, [attendance]);

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="font-heading text-2xl sm:text-3xl font-bold"
      >
        {t("title")}
      </motion.h1>

      {/* Match Selector */}
      <Select value={selectedMatch} onValueChange={(v) => { if (v) setSelectedMatch(v); }}>
        <SelectTrigger className="max-w-sm rounded-xl">
          <SelectValue placeholder={t("selectMatchPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {DEMO_MATCHES.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              vs {m.opponent} — {new Date(m.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {m.status === "upcoming" ? " ⚡" : " ✓"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedMatch ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label={t("confirmed")} value={stats.confirmed} icon={CheckCircle} delay={0.05} />
            <StatCard label={t("declined")} value={stats.declined} icon={XCircle} variant="danger" delay={0.1} />
            <StatCard label={t("pending")} value={stats.pending} icon={Clock} variant="warning" delay={0.15} />
          </div>

          {/* Low player alert */}
          {stats.confirmed < 11 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{t("lowPlayerAlert", { count: stats.confirmed })}</p>
            </motion.div>
          )}

          {/* Player Avatar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {DEMO_PLAYERS.map((player, i) => {
              const att = attendance.find((a) => a.playerId === player.id);
              const status = att?.status || "pending";
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.02 }}
                  className="glass-card p-4 flex items-center gap-3"
                >
                  <span className="jersey-number text-xs w-9 h-9">{player.jerseyNumber}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{player.name}</p>
                    <span className={`text-[0.6rem] px-1.5 py-0.5 rounded ${positionClasses[player.position]}`}>
                      {player.position}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[status]}`}>
                    {statusIcons[status]} {t(status)}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      ) : (
        <EmptyState
          icon="📋"
          title={t("selectMatch")}
          description={t("selectMatchHint")}
        />
      )}
    </div>
  );
}
