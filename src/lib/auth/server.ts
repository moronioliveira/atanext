import { createNeonAuth } from "@neondatabase/auth/next/server";

// Variável vazia conta como ausente. Os valores substitutos só existem para o
// build não quebrar; em uma requisição, `assertAuthConfiguration` recusa o uso.
const baseUrl = process.env.NEON_AUTH_BASE_URL || undefined;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET || undefined;

export const auth = createNeonAuth({
  baseUrl: baseUrl ?? "https://auth-not-configured.invalid",
  cookies: {
    secret: cookieSecret ?? "development-cookie-secret-not-for-use",
  },
});

export function assertAuthConfiguration() {
  if (!baseUrl || !cookieSecret) {
    throw new Error("NEON_AUTH_BASE_URL e NEON_AUTH_COOKIE_SECRET precisam estar configuradas.");
  }
}
