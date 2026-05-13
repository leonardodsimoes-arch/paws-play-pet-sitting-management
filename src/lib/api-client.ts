import { ApiResponse } from "../../shared/types"
import { useAuthStore } from "@/store/use-auth-store"
/**
 * Robust API client for Fluffy & Play services.
 * Handles automatic re-authentication logic and descriptive error reporting.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token && typeof token === 'string') {
    headers.set('Authorization', `Bearer ${token}`);
  }
  try {
    const res = await fetch(path, { ...init, headers });
    // Handle session expiration
    if (res.status === 401) {
      console.warn(`[AUTH] Session expired for ${path}. Redirecting to login.`);
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
      throw new Error('Your session has expired. Please log in again.');
    }
    // Handle worker boot errors or crashes
    if (res.status === 500) {
      const errorText = await res.text();
      console.error(`[API ERROR 500] ${path}:`, errorText);
      throw new Error('The Fluffy server is currently taking a nap. Please try again in a moment.');
    }
    const json = (await res.json()) as ApiResponse<T>;
    if (!res.ok || json.success === false) {
      const errorMessage = typeof json.error === 'string'
        ? json.error
        : `Server responded with ${res.status}`;
      console.error(`[API FAILED] ${path}:`, errorMessage);
      throw new Error(errorMessage);
    }
    if (json.data === undefined) {
      console.error(`[API SCHEMA ERROR] ${path}: Data property missing in success response`);
      throw new Error('Received an incomplete response from the server.');
    }
    return json.data as T;
  } catch (error) {
    if (error instanceof Error) {
      // Don't re-log already handled errors
      if (!error.message.includes('[API')) {
        console.error(`[NETWORK ERROR] ${path}:`, error.message);
      }
      throw error;
    }
    throw new Error('A fluffy network error occurred. Please check your connection.');
  }
}