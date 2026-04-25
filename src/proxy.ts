import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";
import type { NextRequest } from "next/server";

const intlProxy = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export function proxy(request: NextRequest) {
  return intlProxy(request);
}

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - auth routes (Supabase callback — must NOT be locale-prefixed)
  // - _next (Next.js internals)
  // - static files (images, etc.)
  matcher: ["/((?!api|auth|_next|.*\\..*).*)" ],
};
