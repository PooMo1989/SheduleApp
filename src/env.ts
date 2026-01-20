import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Environment Variable Validation
 * 
 * This file ensures all required environment variables are present and valid.
 * The app will fail to start if any required variable is missing.
 * 
 * Usage:
 * import { env } from "@/env";
 * console.log(env.NEXT_PUBLIC_SUPABASE_URL);
 */
export const env = createEnv({
    /**
     * Server-side environment variables (not exposed to browser)
     */
    server: {
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        // Add SUPABASE_SERVICE_ROLE_KEY when needed for admin operations
        // SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    },

    /**
     * Client-side environment variables (exposed to browser)
     * Must be prefixed with NEXT_PUBLIC_
     */
    client: {
        NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    },

    /**
     * Runtime environment - maps env vars to the schema
     * For Next.js, we need to manually map the process.env values
     */
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },

    /**
     * Skip validation in certain environments
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,

    /**
     * Makes it so that empty strings are treated as undefined.
     * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
});
