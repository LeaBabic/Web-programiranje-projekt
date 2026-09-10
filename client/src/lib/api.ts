const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const TOKEN_KEY = 'atelier_token';

export class ApiError extends Error {
  status: number;
  errors?: { path: string; message: string }[];

  constructor(status: number, message: string, errors?: { path: string; message: string }[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Ako je true, šalje se Bearer token iz localStorage. */
  auth?: boolean;
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options;
  const headers: Record<string, string> = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Poslužitelj nije dostupan. Provjerite je li API pokrenut.');
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (data as { message?: string }).message ?? 'Došlo je do greške.',
      (data as { errors?: { path: string; message: string }[] }).errors,
    );
  }

  return data as T;
}

export const apiBase = BASE;
