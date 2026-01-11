/**
 * ChainForge Frontend — Runtime Configuration
 *
 * In production (Vercel), NEXT_PUBLIC_API_URL must be set.
 * In local development, it defaults to localhost backend.
 */

const isBrowser = typeof window !== "undefined";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isBrowser && window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "");
