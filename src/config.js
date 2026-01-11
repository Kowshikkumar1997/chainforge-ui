/**
 * ChainForge Frontend — Runtime Configuration
 *
 * In production (Vercel), NEXT_PUBLIC_API_URL must be set.
 * In local development, it defaults to localhost backend.
 */

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "");

