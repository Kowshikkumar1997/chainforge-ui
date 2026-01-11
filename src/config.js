/**
 * ChainForge Frontend — Runtime Configuration
 *
 * In Vercel/production, REACT_APP_API_BASE_URL must be set.
 * In local development, it defaults to localhost.
 */

const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" &&
   window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "");
