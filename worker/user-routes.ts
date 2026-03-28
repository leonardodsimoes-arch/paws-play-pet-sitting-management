import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, DogEntity, BookingEntity, InvoiceEntity, ChatBoardEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { User, Dog, Booking, Invoice } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const page = await UserEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    return ok(c, page);
  });
  // DOGS
  app.get('/api/dogs', async (c) => {
    await DogEntity.ensureSeed(c.env);
    const page = await DogEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    return ok(c, page);
  });
  app.post('/api/dogs', async (c) => {
    const data = await c.req.json() as Dog;
    if (!data.name || !data.ownerId) return bad(c, 'Missing required dog fields');
    const dog = await DogEntity.create(c.env, { ...data, id: data.id || crypto.randomUUID() });
    return ok(c, dog);
  });
  // BOOKINGS
  app.get('/api/bookings', async (c) => {
    await BookingEntity.ensureSeed(c.env);
    const page = await BookingEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    return ok(c, page);
  });
  app.post('/api/bookings', async (c) => {
    const data = await c.req.json() as Booking;
    const booking = await BookingEntity.create(c.env, { 
      ...data, 
      id: crypto.randomUUID(),
      status: 'pending' 
    });
    // Auto-generate invoice
    await InvoiceEntity.create(c.env, {
      id: crypto.randomUUID(),
      bookingId: booking.id,
      ownerId: booking.ownerId,
      amount: booking.total,
      status: 'unpaid',
      createdAt: new Date().toISOString()
    });
    return ok(c, booking);
  });
  // INVOICES
  app.get('/api/invoices', async (c) => {
    await InvoiceEntity.ensureSeed(c.env);
    const page = await InvoiceEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    return ok(c, page);
  });
  // CHATS (Existing)
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    return ok(c, await ChatBoardEntity.list(c.env));
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const { userId, text } = await c.req.json();
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    return ok(c, await chat.sendMessage(userId, text));
  });
}