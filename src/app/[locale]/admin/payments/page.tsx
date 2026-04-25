"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { StatCard } from "@/components/shared/stat-card";
import { Users, CheckCircle, XCircle, Wallet } from "lucide-react";
import { toast } from "sonner";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHLY_FEE = 100;
const CURRENCY = "SAR";
const YEAR = new Date().getFullYear();

const DEMO_PLAYERS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
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
    "Defender", "Midfielder", "Midfielder", "Midfielder", "Forward"] as const)[i],
}));

// Generate random payment statuses
function generatePayments() {
  const currentMonth = new Date().getMonth();
  const payments: Record<string, boolean> = {};
  DEMO_PLAYERS.forEach((player) => {
    for (let m = 0; m < 12; m++) {
      const key = `${player.id}-${m}`;
      if (m < currentMonth) {
        payments[key] = Math.random() < 0.85;
      } else if (m === currentMonth) {
        payments[key] = Math.random() < 0.6;
      } else {
        payments[key] = false;
      }
    }
  });
  return payments;
}

const positionClasses: Record<string, string> = {
  Goalkeeper: "position-gk",
  Defender: "position-def",
  Midfielder: "position-mid",
  Forward: "position-fwd",
};

export default function PaymentsPage() {
  const t = useTranslations("payments");
  const [year, setYear] = useState(YEAR);
  const [payments, setPayments] = useState(() => generatePayments());

  const currentMonth = new Date().getMonth();

  const isPaid = (playerId: number, monthIdx: number) => {
    return !!payments[`${playerId}-${monthIdx}`];
  };

  const handleToggle = (playerId: number, monthIdx: number) => {
    const key = `${playerId}-${monthIdx}`;
    const currentlyPaid = payments[key];
    setPayments((prev) => ({ ...prev, [key]: !currentlyPaid }));
    toast.success(currentlyPaid ? t("paymentUnmarked") : t("paymentMarked"));
  };

  const stats = useMemo(() => {
    const paidThisMonth = DEMO_PLAYERS.filter((p) => isPaid(p.id, currentMonth)).length;
    const unpaidThisMonth = DEMO_PLAYERS.length - paidThisMonth;
    let totalCollected = 0;
    DEMO_PLAYERS.forEach((p) => {
      for (let m = 0; m <= currentMonth; m++) {
        if (isPaid(p.id, m)) totalCollected += MONTHLY_FEE;
      }
    });
    return { paidThisMonth, unpaidThisMonth, totalCollected };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, currentMonth]);

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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label={t("totalPlayers")} value={DEMO_PLAYERS.length} icon={Users} delay={0.05} />
        <StatCard label={t("paidThisMonth")} value={stats.paidThisMonth} icon={CheckCircle} delay={0.1} />
        <StatCard label={t("unpaid")} value={stats.unpaidThisMonth} icon={XCircle} variant="danger" delay={0.15} />
        <StatCard label={t("totalCollected")} value={`${stats.totalCollected.toLocaleString()} ${CURRENCY}`} icon={Wallet} delay={0.2} />
      </div>

      {/* Year Selector */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">{t("paymentGrid")}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear((y) => y - 1)} className="px-3 py-1.5 rounded-full text-sm bg-accent hover:bg-accent/80 cursor-pointer transition-colors border-none font-medium">
            ←
          </button>
          <span className="font-mono font-bold text-lg min-w-[60px] text-center">{year}</span>
          <button onClick={() => setYear((y) => y + 1)} className="px-3 py-1.5 rounded-full text-sm bg-accent hover:bg-accent/80 cursor-pointer transition-colors border-none font-medium">
            →
          </button>
        </div>
      </div>

      {/* Payment Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-0 overflow-hidden"
      >
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
          <table className="payment-table min-w-full">
            <thead>
              <tr>
                <th className="min-w-[160px] sm:min-w-[180px]">{t("player")}</th>
                {MONTHS.map((m, i) => (
                  <th
                    key={i}
                    className={`min-w-[40px] sm:min-w-[50px] ${i === currentMonth && year === YEAR ? "!text-emerald-500 !font-bold" : ""}`}
                  >
                    <span className="hidden sm:inline">{m}</span>
                    <span className="sm:hidden">{m.slice(0, 3)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_PLAYERS.map((player) => (
                <tr key={player.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="jersey-number text-xs w-8 h-8">{player.jerseyNumber}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm leading-tight truncate">{player.name}</p>
                        <span className={`text-[0.65rem] px-1.5 py-0.5 rounded ${positionClasses[player.position]}`}>
                          {player.position}
                        </span>
                      </div>
                    </div>
                  </td>
                  {MONTHS.map((_, monthIdx) => {
                    const paid = isPaid(player.id, monthIdx);
                    const isFuture = year === YEAR && monthIdx > currentMonth;
                    return (
                      <td key={monthIdx}>
                        {isFuture ? (
                          <span className="text-muted-foreground/30 text-xs">—</span>
                        ) : (
                          <input
                            type="checkbox"
                            className="payment-checkbox mx-auto"
                            checked={paid}
                            onChange={() => handleToggle(player.id, monthIdx)}
                            aria-label={`${player.name} - ${MONTHS[monthIdx]} payment`}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
