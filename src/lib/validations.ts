import { z } from "zod";

export const playerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  phone: z.string().optional().nullable(),
  position: z.enum(["Goalkeeper", "Defender", "Midfielder", "Forward"], {
    message: "Please select a valid position",
  }),
  jerseyNumber: z.string().optional().nullable(),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;

export const matchSchema = z.object({
  opponent: z.string().min(2, "Opponent name must be at least 2 characters").max(50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  location: z.string().optional().nullable(),
});

export type MatchFormValues = z.infer<typeof matchSchema>;

export const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AuthFormValues = z.infer<typeof authSchema>;

// ── Login schema: accepts either an email or phone number + password ──
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{7,15}$/;

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone number is required")
    .refine(
      (val) => emailRegex.test(val) || phoneRegex.test(val),
      "Please enter a valid email address or phone number"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/** Helper to determine if the identifier is an email */
export function isEmail(identifier: string): boolean {
  return emailRegex.test(identifier);
}
