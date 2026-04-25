import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../useSupabase";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useAuth() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const t = useTranslations("common");

  const sendMagicLink = useMutation({
    mutationFn: async ({ email, locale }: { email: string; locale: string }) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Pass locale as a query param so callback knows where to redirect
          emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback?locale=${locale}`,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("success"));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  return {
    sendMagicLink,
    signOut,
  };
}
