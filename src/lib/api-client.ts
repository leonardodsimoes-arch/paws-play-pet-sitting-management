import { ApiResponse } from "../../shared/types"
import { useAuthStore } from "@/store/use-auth-store"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Use a stable selector for the token to prevent unnecessary reactivity issues
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
  if (!res.ok || json.success === false || json.data === undefined) {
    const errorMessage = typeof json.error === 'string' ? json.error : 'Request failed';
    throw new Error(errorMessage);
  }
  return json.data as T;
}