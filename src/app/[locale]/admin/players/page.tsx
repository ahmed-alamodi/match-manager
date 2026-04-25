"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlayers } from "@/hooks/queries/usePlayers";
import { useTeam } from "@/hooks/queries/useTeam";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { playerSchema, type PlayerFormValues } from "@/lib/validations";

const positionIcons: Record<string, string> = {
  Goalkeeper: "🧤",
  Defender: "🛡️",
  Midfielder: "⚙️",
  Forward: "⚡",
};

const positionClasses: Record<string, string> = {
  Goalkeeper: "position-gk",
  Defender: "position-def",
  Midfielder: "position-mid",
  Forward: "position-fwd",
};

export default function PlayersPage() {
  const t = useTranslations("players");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: teamData } = useTeam();
  const { query: { data: players = [], isLoading }, addPlayer, deletePlayer } = usePlayers(teamData?.team?.id);

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: { name: "", phone: "", position: undefined, jerseyNumber: "" },
  });

  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.position.toLowerCase().includes(search.toLowerCase()) ||
      (p.jersey_number && String(p.jersey_number).includes(search))
  );

  const onSubmit = (data: PlayerFormValues) => {
    if (!teamData?.team?.id) return;
    addPlayer.mutate({
      team_id: teamData.team.id,
      name: data.name,
      phone: data.phone || null,
      position: data.position,
      jersey_number: data.jerseyNumber ? parseInt(data.jerseyNumber, 10) : null,
      email: null,
      is_active: true
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-heading text-2xl sm:text-3xl font-bold"
          >
            {t("title")}
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("playerCount", { count: players.length })}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer">
                <Plus className="w-4 h-4 me-2" />
                {t("addPlayer")}
              </Button>
            }
          />
          <DialogContent className="glass-card border-border/50 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">{t("addPlayer")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("name")}</Label>
                <Input {...form.register("name")} className="mt-1.5" />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("phone")}</Label>
                <Input {...form.register("phone")} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("position")}</Label>
                <Select onValueChange={(v) => { if (v) form.setValue("position", v as "Goalkeeper" | "Defender" | "Midfielder" | "Forward"); }}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Goalkeeper">{t("goalkeeper")}</SelectItem>
                    <SelectItem value="Defender">{t("defender")}</SelectItem>
                    <SelectItem value="Midfielder">{t("midfielder")}</SelectItem>
                    <SelectItem value="Forward">{t("forward")}</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.position && <p className="text-red-500 text-xs mt-1">{form.formState.errors.position.message}</p>}
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t("jerseyNumber")}</Label>
                <Input type="number" {...form.register("jerseyNumber")} className="mt-1.5" />
                {form.formState.errors.jerseyNumber && <p className="text-red-500 text-xs mt-1">{form.formState.errors.jerseyNumber.message}</p>}
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" disabled={addPlayer.isPending} className="flex-1 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 cursor-pointer">
                  {addPlayer.isPending ? tCommon("loading") : tCommon("save")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 rounded-full cursor-pointer">
                  {tCommon("cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9 rounded-xl"
        />
      </div>

      {/* Player Cards Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filtered.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              className="glass-card glass-card-hover p-4 group relative"
            >
              <div className="flex items-center gap-3">
                <span className="jersey-number text-sm w-10 h-10">{player.jersey_number || "?"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-sm truncate">{player.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[0.65rem] px-1.5 py-0.5 rounded font-medium ${positionClasses[player.position]}`}>
                      {positionIcons[player.position]} {player.position}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 end-2 text-red-500 hover:bg-red-500/10 cursor-pointer"
                  onClick={() => deletePlayer.mutate(player.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center text-muted-foreground"
        >
          <p>{t("noPlayersMatch")} &quot;{search}&quot;</p>
        </motion.div>
      )}
    </div>
  );
}
