"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-12 text-center"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <p className="text-lg font-heading font-semibold text-foreground/80 mb-2">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
