import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Centralised, validated environment variables.
 *
 * Server-only secrets go in `server`; client-exposed values (must be `NEXT_PUBLIC_*`) go in `client`.
 * Boot fails fast if any required value is missing or fails validation.
 *
 * The Stage C bridge will populate the `BRIDGE_*` and `HUDSON_ONE_*` slots; for now
 * they are optional so Stage A and B can ship without Hudson One credentials.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Kaizen Supabase project (added in Stage C-1.1).
    KAIZEN_SUPABASE_URL: z.string().url().optional(),
    KAIZEN_SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),

    // Hudson One bridge (added in Stage C-1.5 once HW provisions the restricted key).
    HUDSON_ONE_SUPABASE_URL: z.string().url().optional(),
    HUDSON_ONE_SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
    BRIDGE_HMAC_SECRET: z.string().min(32).optional(),
  },
  client: {
    NEXT_PUBLIC_KAIZEN_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_KAIZEN_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    KAIZEN_SUPABASE_URL: process.env.KAIZEN_SUPABASE_URL,
    KAIZEN_SUPABASE_SERVICE_ROLE_KEY: process.env.KAIZEN_SUPABASE_SERVICE_ROLE_KEY,
    HUDSON_ONE_SUPABASE_URL: process.env.HUDSON_ONE_SUPABASE_URL,
    HUDSON_ONE_SUPABASE_SERVICE_ROLE_KEY: process.env.HUDSON_ONE_SUPABASE_SERVICE_ROLE_KEY,
    BRIDGE_HMAC_SECRET: process.env.BRIDGE_HMAC_SECRET,
    NEXT_PUBLIC_KAIZEN_SUPABASE_URL: process.env.NEXT_PUBLIC_KAIZEN_SUPABASE_URL,
    NEXT_PUBLIC_KAIZEN_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_KAIZEN_SUPABASE_ANON_KEY,
  },
  emptyStringAsUndefined: true,
  // Skip validation in CI builds where bridge secrets aren't required (e.g. lint-only jobs).
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
