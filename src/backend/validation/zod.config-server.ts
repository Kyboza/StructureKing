import dotenv from "dotenv"
dotenv.config();

import { z } from "zod";
import { logError } from "../utils/logError.ts";

const baseServerEnvSchema = z.object({
    PORT: z.coerce.number().min(1, "PORT Saknas"),
    MONGODB_URI: z.string().min(1, "MONGODB_URI Saknas"),
    SENTRY_DSN: z.string().min(1, "SENTRY DSN Saknas"),
    ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET Saknas"),
    REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET Saknas"),
    PEPPER_SECRET: z.string().min(1, "PEPPER_SECRET Saknas"),
});

const isTest = process.env.NODE_ENV === "test";

const serverEnvSchema = isTest
  ? baseServerEnvSchema.partial()
  : baseServerEnvSchema;

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const formattedErrors = z.flattenError(parsed.error);
  logError("Ogiltiga miljövariabler");

  for (const [key, error] of Object.entries(formattedErrors.fieldErrors)) {
    logError(`- ${key}: ${error?.join(", ")}`);
  }

  process.exit(1);
}

export const env = parsed.data as z.infer<typeof baseServerEnvSchema>;