import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../useSupabase";
import type { Player } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function usePlayers(teamId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const t = useTranslations("players");
  const tCommon = useTranslations("common");

  const query = useQuery({
    queryKey: ["players", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Player[];
    },
    enabled: !!teamId,
  });

  const addPlayer = useMutation({
    mutationFn: async (player: Omit<Player, "id" | "created_at" | "user_id">) => {
      const { data, error } = await supabase
        .from("players")
        .insert(player)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", teamId] });
      toast.success(t("playerAdded"));
    },
    onError: (error: Error) => {
      toast.error(tCommon("updateFailed"));
      console.error(error);
    },
  });

  const deletePlayer = useMutation({
    mutationFn: async (playerId: string) => {
      const { error } = await supabase.from("players").delete().eq("id", playerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", teamId] });
      toast.success(t("playerDeleted"));
    },
    onError: (error: Error) => {
      toast.error(tCommon("updateFailed"));
      console.error(error);
    },
  });

  return {
    query,
    addPlayer,
    deletePlayer,
  };
}
