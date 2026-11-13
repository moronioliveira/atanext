import { neon } from "@neondatabase/serverless";

/** Cliente SQL do Neon. Use somente em código de servidor. */
export const sql = neon(process.env.DATABASE_URL ?? "");

const UNIQUE_VIOLATION = "23505";

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === UNIQUE_VIOLATION
  );
}
