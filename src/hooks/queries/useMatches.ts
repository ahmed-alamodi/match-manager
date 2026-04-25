import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../useSupabase";
import type { Match } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useMatches(teamId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const t = useTranslations("matches");
  const tCommon = useTranslations("common");

  const query = useQuery({
    queryKey: ["matches", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("team_id", teamId)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      return data as Match[];
    },
    enabled: !!teamId,
  });

  const addMatch = useMutation({
    mutationFn: async (match: Omit<Match, "id" | "created_at" | "status">) => {
      const { data, error } = await supabase
        .from("matches")
        .insert({ ...match, status: "upcoming" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", teamId] });
      toast.success(t("matchAdded"));
    },
    onError: (error: Error) => {
      toast.error(t("failedToAdd"));
      console.error(error);
    },
  });

  return {
    query,
    addMatch,
  };
}
