import { User, Dog, Booking, Invoice, Chat, ChatMessage } from './types';
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Barker', email: 'alex@fluffy.com', role: 'client', password: 'password123' },
  { id: 'u2', name: 'Sam Admin', email: 'admin@fluffy.com', role: 'admin', password: 'password123' }
];
export const MOCK_DOGS: Dog[] = [
  {
    id: 'd1',
    ownerId: 'u1',
    name: 'Buster',
    breed: 'Golden Retriever',
    weight: 32,
    age: 4,
    vaccinesUpToDate: true,
    behavior: 'friendly',
    diet: 'Grain-free fluffy kibble twice daily',
    instructions: 'Loves fluffy belly rubs and chasing tennis balls.'
  },
  {
    id: 'd2',
    ownerId: 'u1',
    name: 'Luna',
    breed: 'French Bulldog',
    weight: 12,
    age: 2,
    vaccinesUpToDate: true,
    behavior: 'shy',
    diet: 'Standard adult fluffy mix',
    instructions: 'Can be nervous around loud trucks. Prefers soft toys.'
  }
];
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    dogId: 'd1',
    ownerId: 'u1',
    serviceType: 'stay',
    startDate: '2024-06-01T07:00:00Z',
    endDate: '2024-06-02T07:00:00Z',
    status: 'confirmed',
    total: 45
  },
  {
    id: 'b2',
    dogId: 'd2',
    ownerId: 'u1',
    serviceType: 'walk',
    startDate: '2024-06-03T10:00:00Z',
    endDate: '2024-06-03T10:30:00Z',
    status: 'pending',
    total: 15
  }
];
export const MOCK_INVOICES: Invoice[] = [
  { id: 'i1', bookingId: 'b1', ownerId: 'u1', amount: 45, status: 'paid', createdAt: '2024-05-28T09:00:00Z' },
  { id: 'i2', bookingId: 'b2', ownerId: 'u1', amount: 15, status: 'unpaid', createdAt: '2024-06-01T09:00:00Z' }
];
export const MOCK_CHATS: Chat[] = [
  { id: 'c1', title: 'General Inquiries', messages: [] }
];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [];