/**
 * Typed API Client for Odoo Backend.
 * Standardizes requests, response envelopes, session headers, and error handling.
 */

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error?: {
    message: string;
    code: string;
  } | null;
};

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "SERVER_ERROR", status = 500) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    const json: ApiResponse<T> = await res.json().catch(() => ({
      success: res.ok,
      data: null,
      error: { message: res.statusText, code: `HTTP_${res.status}` },
    }));

    if (!res.ok || json.success === false) {
      const errMsg = json.error?.message || `Request failed with status ${res.status}`;
      const errCode = json.error?.code || `HTTP_${res.status}`;
      throw new ApiError(errMsg, errCode, res.status);
    }

    return json.data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || "Network request failed", "NETWORK_ERROR", 0);
  }
}
