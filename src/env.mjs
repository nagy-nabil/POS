import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    JWTSECRET: z.string().min(4),
    // expire in period must be more than one minute
    JWTEXPIREIN: z.string().transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Not a number",
        });
        return z.NEVER;
      }

      if (parsed < 60) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "number must be gt 60",
        });
        return z.NEVER;
      }
      return parsed;
    }),
    CRYPTROUNDS: z.string().transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Not a number",
        });
        return z.NEVER;
      }

      return parsed;
    }),
    AzureStorageAccountKey: z.string().min(1),
    AzureStorageAaccountName: z.string().min(1),
    AzureContainerName: z.string().min(1),

    // AUTH
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(10)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url()
    ),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1)
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
DIRECT_URL:process.env.DIRECT_URL,
    NODE_ENV: process.env.NODE_ENV,
    JWTSECRET: process.env.JWTSECRET,
    // expire in period must be more than one minute
    JWTEXPIREIN: process.env.JWTEXPIREIN,
    CRYPTROUNDS: process.env.CRYPTROUNDS,
    AzureStorageAccountKey: process.env.AZURESTORAGEACCOUNTKEY,
    AzureContainerName: process.env.AZURECONTAINERNAME,
    AzureStorageAaccountName: process.env.AZURESTROAGEACCOUNTNAME,

    // AUTH
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  },
});
