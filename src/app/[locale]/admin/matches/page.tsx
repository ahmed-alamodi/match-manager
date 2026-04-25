"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Plus, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useMatches } from "@/hooks/queries/useMatches";
import { useTeam } from "@/hooks/queries/useTeam";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { matchSchema, type MatchFormValues } from "@/lib/validations";

export default function MatchesPage() {
  const t = useTranslations("matches");
  const tCommon = useTranslations("common");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: teamData } = useTeam();
  const { query: { data: matches = [], isLoading }, addMatch } = useMatches(teamData?.team?.id);

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: { date: "", time: "", location: "", opponent: "" },
  });

  const upcoming = matches.filter((m) => m.status === "upcoming").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const completed = matches.filter((m) => m.status === "completed").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const match = new Date(dateStr + "T00:00:00");
    const diff = Math.ceil((match.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return t("today");
    if (diff === 1) return t("tomorrow");
    if (diff > 0) return t("inDays", { days: diff });
    return t("daysAgo", { days: Math.abs(diff) });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const onSubmit = (data: MatchFormValues) => {
    if (!teamData?.team?.id) return;
    addMatch.mutate({
      team_id: teamData.team.id,
      date: data.date,
      time: data.time,
      location: data.location || null,
      opponent: data.opponent,
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        form.reset();
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">{tCommon("loading")}...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-heading text-2xl sm:text-3xl font-bold"
        >
          {t("title")}
        </motion.h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 cursor-pointer" />
            }
          >
              <Plus className="w-4 h-4" />
              {t("addMatch")}
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">{t("addNewMatch")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("dateRequired")}</Label>
                <Input type="date" {...form.register("date")} className="mt-1.5" />
                {form.formState.errors.date && <p className="text-red-500 text-xs mt-1">{form.formState.errors.date.message}</p>}
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("timeRequired")}</Label>
                <Input type="time" {...form.register("time")} className="mt-1.5" />
                {form.formState.errors.time && <p className="text-red-500 text-xs mt-1">{form.formState.errors.time.message}</p>}
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("location")}</Label>
                <Input placeholder={t("locationPlaceholder")} {...form.register("location")} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("opponentRequired")}</Label>
                <Input placeholder={t("opponentPlaceholder")} {...form.register("opponent")} className="mt-1.5" />
                {form.formState.errors.opponent && <p className="text-red-500 text-xs mt-1">{form.formState.errors.opponent.message}</p>}
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" disabled={addMatch.isPending} className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 cursor-pointer">
                  {addMatch.isPending ? tCommon("loading") : t("addMatch")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 rounded-full cursor-pointer">
                  {tCommon("cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline: Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("upcoming")}</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute start-[19px] top-0 bottom-0 w-0.5 bg-border hidden sm:block" />
            <div className="space-y-4">
              {upcoming.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  {/* Timeline dot */}
                  <div className="hidden sm:flex w-10 h-10 rounded-full bg-blue-500/10 border-2 border-blue-500 items-center justify-center flex-shrink-0 z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  {/* Card */}
                  <div className="glass-card glass-card-hover p-5 ps-7 relative flex-1">
                    <div className="match-bar-upcoming" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="mb-2 text-blue-500 border-blue-500/30">
                          {getDaysUntil(match.date)}
                        </Badge>
                        <h4 className="font-heading text-lg font-bold">
                          {t("vs")} {match.opponent}
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
                          {match.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {match.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("completed")}</h3>
          <div className="space-y-3">
            {completed.map((match) => (
              <div key={match.id} className="glass-card p-4 ps-7 relative opacity-70">
                <div className="match-bar-completed" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-semibold">{t("vs")} {match.opponent}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(match.date)} • {match.time} • {match.location}
                    </p>
                  </div>
                  <Badge variant="secondary">{t("completed")}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <EmptyState
          icon="⚽"
          title={t("noMatches")}
          description={t("addMatchHint")}
        />
      )}
    </div>
  );
}
