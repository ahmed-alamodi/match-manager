import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../useSupabase";
import type { Payment } from "@/lib/supabase/types";

export function usePayments(teamId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["payments", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      // We need payments for players in the current team
      // Using a join via postgrest to filter by team_id
      const { data, error } = await supabase
        .from("payments")
        .select("*, players!inner(team_id)")
        .eq("players.team_id", teamId);

      if (error) throw error;
      return data as (Payment & { players: { team_id: string } })[];
    },
    enabled: !!teamId,
  });

  const togglePayment = useMutation({
    mutationFn: async ({ playerId, month, paid, amount }: { playerId: string, month: string, paid: boolean, amount: number }) => {
      if (paid) {
        const { error } = await supabase
          .from("payments")
          .upsert({ 
            player_id: playerId, 
            month, 
            paid: true, 
            amount, 
            paid_date: new Date().toISOString().split('T')[0] 
          }, { onConflict: 'player_id,month' });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("payments")
          .delete()
          .eq("player_id", playerId)
          .eq("month", month);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", teamId] });
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });

  return {
    query,
    togglePayment,
  };
}
