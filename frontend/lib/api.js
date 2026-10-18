/**
 * Server-side API client.
 *
 * Server components render on the Next.js server, so they cannot use the
 * browser's relative `/api` proxy. They call the Express backend directly and,
 * when authentication is required, forward the httpOnly session cookie that
 * was read from the incoming request via `next/headers`.
 */
import { cookies } from 'next/headers';

export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Perform an API request from a server component / route handler.
 * Never throws — always resolves to a normalised result object so that a
 * temporarily unavailable backend degrades gracefully instead of crashing a page.
 */
export async function apiFetch(path, { method = 'GET', body, auth = false, revalidate, cache } = {}) {
  const headers = { ...JSON_HEADERS };

  if (auth) {
    const store = await cookies();
    const token = store.get('academy_token')?.value;
    if (token) headers.cookie = `academy_token=${token}`;
  }

  const options = { method, headers, cache: cache || 'no-store' };
  if (body !== undefined) options.body = JSON.stringify(body);
  if (typeof revalidate === 'number') {
    delete options.cache;
    options.next = { revalidate };
  }

  try {
    const res = await fetch(`${BACKEND_URL}${path}`, options);
    const json = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      status: res.status,
      message: json.message || '',
      data: json.data ?? null,
      meta: json.meta ?? null,
      errors: json.errors ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: 'Unable to reach the API server. Please try again shortly.',
      data: null,
      meta: null,
      errors: null,
    };
  }
}

/** Fetch that tolerates failure and falls back to a sensible default value. */
export async function safeGet(path, fallback = null, opts = {}) {
  const res = await apiFetch(path, opts);
  return res.ok ? res.data ?? fallback : fallback;
}

/** Returns the currently authenticated user from the session cookie, or null. */
export async function getCurrentUser() {
  const res = await apiFetch('/api/auth/me', { auth: true });
  return res.ok ? res.data?.user ?? null : null;
}
