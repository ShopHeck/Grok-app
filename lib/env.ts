import { z } from "zod";

/**
 * Environment variable validation schema.
 * This runs at startup to fail fast if required env vars are missing.
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_PRO_PRICE_ID: z.string().startsWith("price_"),
  STRIPE_TEAM_PRICE_ID: z.string().startsWith("price_"),

  // xAI
  XAI_API_KEY: z.string().min(1),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates all required environment variables.
 * Call this in instrumentation.ts or at app startup.
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues.map(
      (issue) => `  - ${issue.path.join(".")}: ${issue.message}`
    );

    console.error(
      `\n❌ Missing or invalid environment variables:\n${missing.join("\n")}\n`
    );

    throw new Error(
      `Environment validation failed. ${result.error.issues.length} issue(s) found.`
    );
  }

  return result.data;
}

/**
 * Get a validated env var with a helpful error if missing.
 * Use this instead of process.env.X! to get better error messages.
 */
export function getEnv(key: keyof Env): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Environment variable ${key} is required but not set. Check your .env file.`
    );
  }
  return value;
}
