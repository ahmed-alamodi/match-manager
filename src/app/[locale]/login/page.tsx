"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Phone,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues, isEmail } from "@/lib/validations";
import { useAuth } from "@/hooks/queries/useAuth";

// ── Inline Google SVG icon ──
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function AdminLoginPage() {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Auth mutations from the shared hook ──
  const { signInWithPassword, signInWithGoogle } = useAuth();

  // ── Local UI state ──
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(
    // If the auth callback redirected here with an error param, show it immediately
    searchParams.get("error") === "auth_failed" ? t("loginFailed") : null
  );

  // ── Form setup with Zod-powered validation ──
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  // The current value of the identifier field — used to show a contextual icon
  const identifierValue = form.watch("identifier");
  const identifierIsEmail = isEmail(identifierValue || "");

  // ── Handle email/phone + password submit ──
  const onSubmit = (data: LoginFormValues) => {
    setServerError(null);

    signInWithPassword.mutate(
      { identifier: data.identifier, password: data.password },
      {
        onSuccess: () => {
          // Redirect to admin dashboard on successful login
          router.push(`/${locale}/admin`);
        },
        onError: (error) => {
          setServerError(error.message);
        },
      }
    );
  };

  // ── Handle Google OAuth ──
  const handleGoogleSignIn = () => {
    setServerError(null);
    signInWithGoogle.mutate({ locale });
  };

  // Convenience booleans for loading states
  const isPasswordLoading = signInWithPassword.isPending;
  const isGoogleLoading = signInWithGoogle.isPending;
  const isAnyLoading = isPasswordLoading || isGoogleLoading;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      {/* ── Top-right theme toggle ── */}
      <div className="absolute top-4 end-4 z-50 flex items-center gap-2">
        <ThemeToggle />
      </div>

      {/* ── Switch to player view link ── */}
      <div className="absolute top-4 start-4 z-50">
        <button
          onClick={() => router.push(`/${locale}/player-login`)}
          className="text-sm text-muted-foreground hover:text-foreground font-medium cursor-pointer bg-transparent border-none transition-colors"
        >
          {t("switchToPlayer")} →
        </button>
      </div>

      {/* ── Main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 md:p-12 max-w-md w-full"
      >
        {/* ── Logo + heading ── */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Match Manager Logo"
            width={80}
            height={80}
            className="mx-auto mb-6 rounded-2xl shadow-lg"
          />
          <h1 className="font-heading text-2xl font-bold mb-1">
            {t("loginTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("loginSubtitle")}</p>
        </div>

        {/* ── Server / callback error banner ── */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </motion.div>
        )}

        {/* ── Email / Phone + Password form ── */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 text-start"
        >
          {/* Identifier (email or phone) field */}
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block font-medium">
              {t("identifierLabel")}
            </label>
            <div className="relative">
              {/* Dynamic icon: Mail for email, Phone for phone */}
              <div className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                {identifierValue && !identifierIsEmail ? (
                  <Phone className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>
              <Input
                type="text"
                placeholder={t("identifierPlaceholder")}
                {...form.register("identifier")}
                className={`w-full h-11 ps-10 ${
                  form.formState.errors.identifier
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                dir="ltr"
                disabled={isAnyLoading}
                autoComplete="username"
              />
            </div>
            {form.formState.errors.identifier && (
              <p className="text-red-500 text-xs mt-1.5">
                {form.formState.errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block font-medium">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <div className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                {...form.register("password")}
                className={`w-full h-11 ps-10 pe-10 ${
                  form.formState.errors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                dir="ltr"
                disabled={isAnyLoading}
                autoComplete="current-password"
              />
              {/* Show/hide password toggle */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1.5">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isAnyLoading}
            className="w-full rounded-full h-12 mt-2 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {isPasswordLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("signingIn")}
              </>
            ) : (
              <>
                {t("signIn")}
                <ArrowRight className="w-4 h-4 ms-auto" />
              </>
            )}
          </Button>
        </form>

        {/* ── OR divider ── */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {t("orDivider")}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* ── Google OAuth button ── */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isAnyLoading}
          className="w-full rounded-full h-12 text-base font-semibold border-border/50 hover:bg-accent cursor-pointer gap-3"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <GoogleIcon className="w-5 h-5" />
          )}
          {t("signInWithGoogle")}
        </Button>

        {/* ── Footer: switch to player view ── */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <button
            onClick={() => router.push(`/${locale}/player-login`)}
            className="text-sm text-emerald-500 hover:underline font-medium cursor-pointer bg-transparent border-none"
          >
            → {t("switchToPlayer")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
