import { ApiResponse } from "../../shared/types"
import { useAuthStore } from "@/store/use-auth-store"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token && typeof token === 'string') {
    headers.set('Authorization', `Bearer ${token}`);
  }
  try {
    const res = await fetch(path, { ...init, headers });
    if (res.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
    const json = (await res.json()) as ApiResponse<T>;
    if (!res.ok || json.success === false) {
      const errorMessage = typeof json.error === 'string' 
        ? json.error 
        : `Request failed with status ${res.status}`;
      throw new Error(`[Status ${res.status}] ${errorMessage}`);
    }
    // Distinguish between undefined (error) and null (valid empty state)
    if (json.data === undefined) {
      throw new Error(`[Status ${res.status}] Response data is missing`);
    }
    return json.data as T;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[API Error] ${path}:`, error.message);
      throw error;
    }
    throw new Error('An unexpected network error occurred');
  }
}