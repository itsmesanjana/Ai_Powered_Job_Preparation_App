/**
 * Central API configuration.
 * In production (Vercel), NEXT_PUBLIC_API_URL is set to the Render backend URL.
 * Locally, it falls back to localhost:8000.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
