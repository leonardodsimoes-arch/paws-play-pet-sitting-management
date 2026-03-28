import { ApiResponse } from "../../shared/types"
import { useAuthStore } from "@/store/use-auth-store"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(path, { ...init, headers });
  if (res.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}