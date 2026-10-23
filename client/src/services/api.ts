const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
let accessToken: string | null = null;
export function setAccessToken(token: string | null) { accessToken = token; }
async function sendRequest(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${baseUrl}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...init.headers } });
}
export async function authenticatedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  let response = await sendRequest(path, init);
  if (response.status === 401 && path !== '/auth/refresh') {
    try {
      await refreshSession();
      response = await sendRequest(path, init);
    } catch { /* Return the original unauthorized response for the caller to handle. */ }
  }
  return response;
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await authenticatedFetch(path, init);
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error ?? 'Request failed'); }
  return response.status === 204 ? (undefined as T) : response.json();
}
export async function refreshSession() { const result = await api<{ accessToken: string; user: User }>('/auth/refresh', { method: 'POST' }); setAccessToken(result.accessToken); return result; }
export type User = { id: string; displayName: string; email: string };
export type Conversation = { _id: string; title: string; lastMessageAt: string };
export type Message = { _id: string; role: 'user' | 'assistant'; content: string };
export { baseUrl };
