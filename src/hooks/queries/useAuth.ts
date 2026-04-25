import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../useSupabase";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { isEmail } from "@/lib/validations";

export function useAuth() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const t = useTranslations("common");

  // ── Magic link (OTP) login ──
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

  // ── Email / Phone + Password login ──
  const signInWithPassword = useMutation({
    mutationFn: async ({
      identifier,
      password,
    }: {
      identifier: string;
      password: string;
    }) => {
      // Determine whether the identifier is an email or phone number
      const credentials = isEmail(identifier)
        ? { email: identifier, password }
        : { phone: identifier, password };

      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ── Google OAuth login ──
  const signInWithGoogle = useMutation({
    mutationFn: async ({ locale }: { locale: string }) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.protocol}//${window.location.host}/auth/callback?locale=${locale}`,
        },
      });
      if (error) throw error;
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ── Sign out ──
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
    signInWithPassword,
    signInWithGoogle,
    signOut,
  };
}
