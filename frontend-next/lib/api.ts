"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

export const API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  /** Set false for public endpoints. Default true. */
  auth?: boolean;
}

/**
 * API client bound to the signed-in Clerk session.
 * Attaches the Clerk JWT as a Bearer token — the backend verifies it via Clerk's JWKS.
 */
export function useApi() {
  const { getToken, isSignedIn } = useAuth();

  return useCallback(
    async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
      const headers: Record<string, string> = {};
      if (opts.auth !== false && isSignedIn) {
        const token = await getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      if (opts.body !== undefined) headers["Content-Type"] = "application/json";

      let res: Response;
      try {
        res = await fetch(`${API_URL}${path}`, {
          method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
          headers,
          body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        });
      } catch {
        throw new ApiError(0, `Cannot reach the API at ${API_URL}. Is the backend running?`);
      }

      if (res.status === 401 && opts.auth !== false) {
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        throw new ApiError(401, "Session expired. Please sign in again.");
      }

      let data: unknown = null;
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (!res.ok) {
        const detail =
          data && typeof data === "object" && "detail" in data
            ? (data as { detail: unknown }).detail
            : res.statusText;
        throw new ApiError(res.status, typeof detail === "string" ? detail : "Request failed");
      }

      return data as T;
    },
    [getToken, isSignedIn],
  );
}
