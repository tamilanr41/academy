'use client';

/**
 * Browser-side API client.
 *
 * All requests are made to same-origin relative URLs so the Next.js rewrite
 * proxy forwards them to the backend and the session cookie is included
 * automatically (credentials: 'include').
 */
export async function clientFetch(path, { method = 'GET', body, signal } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  try {
    const res = await fetch(path, {
      method,
      credentials: 'include',
      signal,
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      status: res.status,
      message: json.message || (res.ok ? 'Success' : 'Something went wrong'),
      data: json.data ?? null,
      meta: json.meta ?? null,
      errors: json.errors ?? null,
    };
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    return {
      ok: false,
      status: 0,
      message: 'Network error. Please check your connection and try again.',
      data: null,
      meta: null,
      errors: null,
    };
  }
}

export const clientGet = (path, opts) => clientFetch(path, { ...opts, method: 'GET' });
export const clientPost = (path, body, opts) => clientFetch(path, { ...opts, method: 'POST', body });
export const clientPatch = (path, body, opts) => clientFetch(path, { ...opts, method: 'PATCH', body });
export const clientDelete = (path, opts) => clientFetch(path, { ...opts, method: 'DELETE' });

/** Upload a single file to the admin upload endpoint and return its URL. */
export async function uploadFile(file, folder = 'academy') {
  const form = new FormData();
  form.append('file', file);
  return clientFetch(`/api/admin/uploads?folder=${encodeURIComponent(folder)}`, { method: 'POST', body: form });
}

/** Replace the logged-in user's profile photo. */
export async function uploadAvatar(file) {
  const form = new FormData();
  form.append('file', file);
  return clientFetch('/api/auth/avatar', { method: 'POST', body: form });
}

/** Attach an identity document to the logged-in student's profile. */
export async function uploadStudentDocument(file, { type = 'other', number = '' } = {}) {
  const form = new FormData();
  form.append('file', file);
  form.append('type', type);
  form.append('number', number);
  return clientFetch('/api/student/documents', { method: 'POST', body: form });
}
