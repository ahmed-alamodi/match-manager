import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../useSupabase";
import type { Team } from "@/lib/supabase/types";

export function useTeam() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["current-team"],
    queryFn: async () => {
      // Get current user session
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      
      const userId = authData.session?.user.id;
      if (!userId) return null;

      // Fetch team where admin_id is the user's id
      // Since a user might be an admin of a team OR a player of a team,
      // we check teams table first for admin.
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("admin_id", userId)
        .single();

      if (!teamError && teamData) {
        return { team: teamData as Team, role: "admin" as const };
      }

      // If not admin, check if they are a player
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("*, teams(*)")
        .eq("user_id", userId)
        .single();

      if (!playerError && playerData && playerData.teams) {
        return { 
          team: playerData.teams as unknown as Team, 
          role: "player" as const, 
          player: playerData 
        };
      }

      // If no team and not a player, auto-create a default team (First time onboarding)
      const { data: newTeam, error: createError } = await supabase
        .from("teams")
        .insert({
          name: "My Football Team",
          admin_id: userId,
          currency: "SAR",
          monthly_fee: 100
        })
        .select()
        .single();

      if (!createError && newTeam) {
        return { team: newTeam as Team, role: "admin" as const };
      }

      return null;
    },
  });
}
