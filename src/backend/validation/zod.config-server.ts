import dotenv from "dotenv"
dotenv.config();

import { z } from "zod";
import { logError } from "../utils/logError";

const baseServerEnvSchema = z.object({
    PORT: z.number().min(1, 'PORT Saknas'),
    MONGODB_URI: z.string().min(1, "MONGODB_URI Saknas"),
    SETNRY_DSN: z.string().min(1, "SENTRY DSN Saknas"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET Saknas"),
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