"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "danger" | "warning" | "info";
  delay?: number;
}

const variantStyles = {
  default: "stat-number",
  danger: "stat-number stat-number-danger",
  warning: "stat-number stat-number-warning",
  info: "stat-number",
};

const iconBgStyles = {
  default: "bg-emerald-500/10 text-emerald-500",
  danger: "bg-red-500/10 text-red-500",
  warning: "bg-amber-500/10 text-amber-500",
  info: "bg-blue-500/10 text-blue-500",
};

export function StatCard({ label, value, icon: Icon, variant = "default", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card glass-card-hover p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            {label}
          </p>
          <p className={cn(variantStyles[variant], "text-xl sm:text-2xl")}>
            {value}
          </p>
        </div>
        <div className={cn("p-2.5 rounded-xl flex-shrink-0", iconBgStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
