"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, type AuthFormValues } from "@/lib/validations";
import { useAuth } from "@/hooks/queries/useAuth";

export default function AdminLoginPage() {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { sendMagicLink } = useAuth();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "dummy-password" }, // password omitted from UI but needed for schema if shared, actually we use magic link so we only need email. Let's redefine schema logic here or ignore password.
  });

  const onSubmit = (data: AuthFormValues) => {
    sendMagicLink.mutate({ email: data.email, locale });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      {/* Top actions */}
      <div className="absolute top-4 end-4 z-50 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 start-4 z-50">
        <button
          onClick={() => router.push(`/${locale}/player-login`)}
          className="text-sm text-muted-foreground hover:text-foreground font-medium cursor-pointer bg-transparent border-none transition-colors"
        >
          {t("switchToPlayer")} →
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 md:p-12 max-w-md w-full text-center"
      >
        <Image
          src="/logo.png"
          alt="Match Manager Logo"
          width={80}
          height={80}
          className="mx-auto mb-6 rounded-2xl shadow-lg"
        />
        <h1 className="font-heading text-2xl font-bold mb-2">{tApp("name")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("loginSubtitle")}</p>

        {sendMagicLink.isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-6"
          >
            <Mail className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-medium">{t("checkEmail")}</p>
          </motion.div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-start mb-6">
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">
                {t("emailLabel")}
              </label>
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                {...form.register("email")}
                className={`w-full ${form.formState.errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                dir="ltr"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={sendMagicLink.isPending}
              className="w-full rounded-full h-12 mt-2 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {sendMagicLink.isPending ? tCommon("loading") : t("sendMagicLink")}
              {!sendMagicLink.isPending && <ArrowRight className="w-4 h-4 ms-auto" />}
            </Button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-border">
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
