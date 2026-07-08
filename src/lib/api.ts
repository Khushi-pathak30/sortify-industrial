// Central API client for the SORTIFY AI backend.
// Backend base URL is configured via VITE_API_BASE_URL (see .env).
// Defaults to the hosted Render deployment so the frontend works out of the box.

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://sortify-backendnew.onrender.com/api/v1";

export const WS_URL: string =
  (import.meta.env.VITE_WS_URL as string | undefined) ??
  "wss://sortify-backendnew.onrender.com/api/v1/ws";

const TOKEN_KEY = "sortify.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export type ApiError = { code: string; message: string };

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const separator = path.includes("?") ? "&" : "?";
  const url = `${API_BASE_URL}${path}${separator}_t=${Date.now()}`;

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err: ApiError = body?.error ?? {
      code: `HTTP_${res.status}`,
      message: res.statusText || "Request failed",
    };
    throw Object.assign(new Error(err.message), { code: err.code, status: res.status });
  }
  return body as T;
}
