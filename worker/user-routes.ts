import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, DogEntity, BookingEntity, InvoiceEntity, ChatBoardEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Dog, Booking, User, LoginPayload, AuthResponse } from "@shared/types";
// Simple middleware-like check
async function getAuthUser(c: any): Promise<User | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  // Verify token (Mock Logic)
  if (!token.startsWith('mock-token-')) return null;
  const userId = token.replace('mock-token-', '');
  const userEntity = new UserEntity(c.env, userId);
  if (!(await userEntity.exists())) return null;
  return await userEntity.getState();
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // AUTH
  app.post('/api/auth/login', async (c) => {
    const { email } = await c.req.json() as LoginPayload;
    await UserEntity.ensureSeed(c.env);
    const usersPage = await UserEntity.list(c.env);
    const user = usersPage.items.find(u => u.email === email);
    if (!user) return bad(c, 'Invalid credentials');
    const response: AuthResponse = {
      user,
      token: `mock-token-${user.id}`
    };
    return ok(c, response);
  });
  app.get('/api/auth/me', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    return ok(c, user);
  });
  // PROTECTED ROUTES - Applied basic check per-route for this phase
  app.get('/api/users', async (c) => {
    const user = await getAuthUser(c);
    if (!user || user.role !== 'admin') return c.json({ success: false, error: 'Unauthorized' }, 401);
    const page = await UserEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    return ok(c, page);
  });
  app.get('/api/dogs', async (c) => {
    if (!(await getAuthUser(c))) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const page = await DogEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    return ok(c, page);
  });
  app.get('/api/dogs/:id', async (c) => {
    if (!(await getAuthUser(c))) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    const entity = new DogEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Buddy not found');
    return ok(c, await entity.getState());
  });
  app.post('/api/dogs', async (c) => {
    if (!(await getAuthUser(c))) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const data = await c.req.json() as Dog;
    const dog = await DogEntity.create(c.env, { ...data, id: data.id || crypto.randomUUID() });
    return ok(c, dog);
  });
  app.get('/api/bookings', async (c) => {
    if (!(await getAuthUser(c))) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const page = await BookingEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    return ok(c, page);
  });
  app.post('/api/bookings', async (c) => {
    if (!(await getAuthUser(c))) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const data = await c.req.json() as Booking;
    const booking = await BookingEntity.create(c.env, { ...data, id: crypto.randomUUID(), status: 'pending' });
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
  app.patch('/api/bookings/:id', async (c) => {
    const user = await getAuthUser(c);
    if (!user || user.role !== 'admin') return c.json({ success: false, error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    const patch = await c.req.json();
    const entity = new BookingEntity(c.env, id);
    const updated = await entity.mutate(s => ({ ...s, ...patch }));
    return ok(c, updated);
  });
  app.delete('/api/bookings/:id', async (c) => {
    if (!(await getAuthUser(c))) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    const okDel = await BookingEntity.delete(c.env, id);
    return okDel ? ok(c, { id }) : notFound(c);
  });
  app.get('/api/invoices', async (c) => {
    const user = await getAuthUser(c);
    if (!user || user.role !== 'admin') return c.json({ success: false, error: 'Unauthorized' }, 401);
    const page = await InvoiceEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    return ok(c, page);
  });
  app.patch('/api/invoices/:id', async (c) => {
    const user = await getAuthUser(c);
    if (!user || user.role !== 'admin') return c.json({ success: false, error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    const patch = await c.req.json();
    const entity = new InvoiceEntity(c.env, id);
    const updated = await entity.mutate(s => ({ ...s, ...patch }));
    return ok(c, updated);
  });
}