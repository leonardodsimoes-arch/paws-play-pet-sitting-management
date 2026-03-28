import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, DogEntity, BookingEntity, InvoiceEntity, ChatBoardEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Dog, Booking, User, LoginPayload, AuthResponse } from "@shared/types";
async function getAuthUser(c: any): Promise<User | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token.startsWith('mock-token-')) return null;
  const userId = token.replace('mock-token-', '');
  const userEntity = new UserEntity(c.env, userId);
  if (!(await userEntity.exists())) return null;
  return await userEntity.getState();
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
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
  app.get('/api/users', async (c) => {
    const user = await getAuthUser(c);
    if (!user || user.role !== 'admin') return c.json({ success: false, error: 'Unauthorized' }, 401);
    const page = await UserEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    return ok(c, page);
  });
  app.get('/api/users/:id', async (c) => {
    const user = await getAuthUser(c);
    if (!user || user.role !== 'admin') return c.json({ success: false, error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    const entity = new UserEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'User not found');
    return ok(c, await entity.getState());
  });
  app.get('/api/dogs', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const page = await DogEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    if (user.role === 'client') {
      page.items = page.items.filter(d => d.ownerId === user.id);
    }
    return ok(c, page);
  });
  app.get('/api/dogs/:id', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    const entity = new DogEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Buddy not found');
    const dog = await entity.getState();
    if (user.role === 'client' && dog.ownerId !== user.id) return c.json({ success: false, error: 'Forbidden' }, 403);
    return ok(c, dog);
  });
  app.post('/api/dogs', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const data = await c.req.json() as Dog;
    const ownerId = user.role === 'admin' ? (data.ownerId || user.id) : user.id;
    const dog = await DogEntity.create(c.env, { ...data, ownerId, id: data.id || crypto.randomUUID() });
    return ok(c, dog);
  });
  app.get('/api/bookings', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const page = await BookingEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    if (user.role === 'client') {
      page.items = page.items.filter(b => b.ownerId === user.id);
    }
    return ok(c, page);
  });
  app.post('/api/bookings', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const data = await c.req.json() as Booking;
    const ownerId = user.role === 'admin' ? (data.ownerId || user.id) : user.id;
    const booking = await BookingEntity.create(c.env, { ...data, ownerId, id: crypto.randomUUID(), status: 'pending' });
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
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    const patch = await c.req.json();
    const entity = new BookingEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c);
    const current = await entity.getState();
    if (user.role === 'client' && current.ownerId !== user.id) return c.json({ success: false, error: 'Forbidden' }, 403);
    const updated = await entity.mutate(s => ({ ...s, ...patch }));
    return ok(c, updated);
  });
  app.delete('/api/bookings/:id', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    const entity = new BookingEntity(c.env, id);
    if (await entity.exists()) {
      const b = await entity.getState();
      if (user.role === 'client' && b.ownerId !== user.id) return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const okDel = await BookingEntity.delete(c.env, id);
    return okDel ? ok(c, { id }) : notFound(c);
  });
  app.get('/api/invoices', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const page = await InvoiceEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    if (user.role === 'client') {
      page.items = page.items.filter(inv => inv.ownerId === user.id);
    }
    return ok(c, page);
  });
  app.patch('/api/invoices/:id', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    const patch = await c.req.json();
    const entity = new InvoiceEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c);
    const current = await entity.getState();
    if (user.role === 'client' && current.ownerId !== user.id) return c.json({ success: false, error: 'Forbidden' }, 403);
    const updated = await entity.mutate(s => ({ ...s, ...patch }));
    return ok(c, updated);
  });
}