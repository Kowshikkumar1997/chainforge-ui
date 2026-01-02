/**
 * Frontend runtime configuration
 *
 * API base URL is injected via environment variables in production (Vercel)
 * and defaults to localhost for local development.
 */
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
