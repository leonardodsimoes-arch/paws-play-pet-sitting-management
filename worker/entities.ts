import { IndexedEntity } from "./core-utils";
import type { User, Dog, Booking, Invoice, Chat, ChatMessage } from "@shared/types";
import { MOCK_CHATS, MOCK_USERS, MOCK_DOGS, MOCK_BOOKINGS, MOCK_INVOICES } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "", email: "", role: "client" };
  static seedData = MOCK_USERS;
}
export class DogEntity extends IndexedEntity<Dog> {
  static readonly entityName = "dog";
  static readonly indexName = "dogs";
  static readonly initialState: Dog = {
    id: "",
    ownerId: "",
    name: "",
    breed: "",
    weight: 0,
    age: 0,
    vaccinesUpToDate: false,
    behavior: "friendly",
    diet: "",
    instructions: ""
  };
  static seedData = MOCK_DOGS;
}
export class BookingEntity extends IndexedEntity<Booking> {
  static readonly entityName = "booking";
  static readonly indexName = "bookings";
  static readonly initialState: Booking = {
    id: "",
    dogId: "",
    ownerId: "",
    serviceType: "daycare",
    startDate: "",
    endDate: "",
    status: "pending",
    total: 0
  };
  static seedData = MOCK_BOOKINGS;
}
export class InvoiceEntity extends IndexedEntity<Invoice> {
  static readonly entityName = "invoice";
  static readonly indexName = "invoices";
  static readonly initialState: Invoice = {
    id: "",
    bookingId: "",
    ownerId: "",
    amount: 0,
    status: "unpaid",
    createdAt: ""
  };
  static seedData = MOCK_INVOICES;
}
export class ChatBoardEntity extends IndexedEntity<Chat> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: Chat = { id: "", title: "", messages: [] };
  static seedData = MOCK_CHATS;
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}