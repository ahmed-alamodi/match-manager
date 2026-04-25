import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../useSupabase";
import type { Attendance, Player } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useAttendance(matchId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");

  const query = useQuery({
    queryKey: ["attendance", matchId],
    queryFn: async () => {
      if (!matchId) return [];
      const { data, error } = await supabase
        .from("attendance")
        .select("*, player:players(*)")
        .eq("match_id", matchId);

      if (error) throw error;
      return data as (Attendance & { player: Player })[];
    },
    enabled: !!matchId,
  });

  const updateAttendance = useMutation({
    mutationFn: async ({ matchId, playerId, status }: { matchId: string, playerId: string, status: Attendance["status"] }) => {
      const { data, error } = await supabase
        .from("attendance")
        .upsert({
          match_id: matchId,
          player_id: playerId,
          status,
          responded_at: new Date().toISOString(),
        }, { onConflict: "match_id,player_id" })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ["player-attendance"] });
      toast.success(t("attendanceConfirmed"));
    },
    onError: (error: Error) => {
      toast.error(tCommon("updateFailed"));
      console.error(error);
    },
  });

  return {
    query,
    updateAttendance,
  };
}
