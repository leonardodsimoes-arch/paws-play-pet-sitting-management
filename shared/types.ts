export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
}
export interface AuthResponse {
  user: User;
  token: string;
}
export interface LoginPayload {
  email: string;
  password?: string;
}
export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
}
export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  weight: number;
  age: number;
  vaccinesUpToDate: boolean;
  behavior: 'friendly' | 'shy' | 'aggressive' | 'reactive';
  diet: string;
  instructions: string;
  photoUrl?: string;
}
export type ServiceType = 'stay' | 'daycare' | 'walk';
export interface Booking {
  id: string;
  dogId: string;
  ownerId: string;
  serviceType: ServiceType;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total: number;
}
export interface Invoice {
  id: string;
  bookingId: string;
  ownerId: string;
  amount: number;
  status: 'unpaid' | 'paid';
  createdAt: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}
export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
}