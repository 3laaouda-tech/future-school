// Base URL of the backend API. Configurable via .env so it's easy to
// point at a different backend (local vs. deployed) without touching code.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Generic error shape thrown when a request fails, carrying the HTTP status
// so callers can react differently to 401 vs 400 vs 500, etc.
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Thin wrapper around fetch: adds the JSON content-type, parses the JSON
// response, and turns non-2xx responses into a thrown ApiError.
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || "Something went wrong", response.status);
  }

  return data as T;
}
