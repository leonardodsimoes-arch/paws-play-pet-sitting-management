import { Hono, Context } from "hono";
import type { Env } from './core-utils';
import { UserEntity, DogEntity, BookingEntity, InvoiceEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Dog, Booking, User, LoginPayload, AuthResponse, RegisterPayload } from "@shared/types";
// Static flag to prevent multiple seeding calls per worker instance life
let hasSeeded = false;
async function getAuthUser(c: Context<{ Bindings: Env }>): Promise<User | null> {
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
  // Global middleware for seeding demo accounts on first request
  app.use('*', async (c, next) => {
    if (!hasSeeded && c.req.path.startsWith('/api/')) {
      try {
        await UserEntity.ensureDemoAccounts(c.env);
        hasSeeded = true;
      } catch (e) {
        console.error('[SEED] Initialization error:', e);
      }
    }
    await next();
  });
  app.post('/api/auth/login', async (c) => {
    try {
      // FORCE SEEDING check here to ensure demo accounts exist before we try to query them.
      // This solves issues in clean environments where middleware might not have finished or triggered.
      await UserEntity.ensureDemoAccounts(c.env);
      const { email, password } = await c.req.json() as LoginPayload;
      if (!email) return bad(c, 'Email required');
      // Fetch users to find match
      const usersPage = await UserEntity.list(c.env, null, 100);
      const user = usersPage.items.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        console.warn(`[AUTH] Login failed: User not found for ${email}`);
        return bad(c, 'Invalid credentials');
      }
      // Simple password check for demo
      if (password && user.password && user.password !== password) {
        return bad(c, 'Invalid credentials');
      }
      const response: AuthResponse = {
        user,
        token: `mock-token-${user.id}`
      };
      return ok(c, response);
    } catch (e) {
      console.error(`[AUTH] Login crash:`, e);
      return bad(c, 'Login process failed');
    }
  });
  app.get('/api/auth/me', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    return ok(c, user);
  });
  app.get('/api/users', async (c) => {
    const user = await getAuthUser(c);
    if (!user || user.role !== 'admin') return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    const page = await UserEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    return ok(c, page);
  });
  app.get('/api/users/:id', async (c) => {
    const user = await getAuthUser(c);
    if (!user || user.role !== 'admin') return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    const id = c.req.param('id');
    const entity = new UserEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'User not found');
    return ok(c, await entity.getState());
  });
  app.get('/api/dogs', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    const page = await DogEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    if (user.role === 'client') {
      page.items = page.items.filter(d => d.ownerId === user.id);
    }
    return ok(c, page);
  });
  app.get('/api/dogs/:id', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    const id = c.req.param('id');
    const entity = new DogEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Buddy not found');
    const dog = await entity.getState();
    if (user.role === 'client' && dog.ownerId !== user.id) return c.json({ success: false, error: 'Forbidden' } as any, 403);
    return ok(c, dog);
  });
  app.post('/api/dogs', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    const data = await c.req.json() as Dog;
    const ownerId = user.role === 'admin' ? (data.ownerId || user.id) : user.id;
    const dog = await DogEntity.create(c.env, { ...data, ownerId, id: data.id || crypto.randomUUID() });
    return ok(c, dog);
  });
  app.get('/api/bookings', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    const page = await BookingEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    if (user.role === 'client') {
      page.items = page.items.filter(b => b.ownerId === user.id);
    }
    return ok(c, page);
  });
  app.post('/api/bookings', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    const data = await c.req.json() as Booking;
    const ownerId = user.role === 'admin' ? (data.ownerId || user.id) : user.id;
    const booking = await BookingEntity.create(c.env, { ...data, ownerId, id: crypto.randomUUID(), status: 'pending' });
    await InvoiceEntity.create(c.env, {
      id: crypto.randomUUID(),
      bookingId: booking.id,
      ownerId: booking.ownerId,
      amount: booking.total || data.total || 0,
      status: 'unpaid',
      createdAt: new Date().toISOString()
    });
    return ok(c, booking);
  });
  app.post('/api/auth/register', async (c) => {
    try {
      const payload = await c.req.json() as RegisterPayload;
      const {
        name, email, password, phone,
        address, city, state, zip,
        emergencyName, emergencyPhone
      } = payload;
      if (!name || !email || !password) return bad(c, 'Missing required fields');
      const usersPage = await UserEntity.list(c.env);
      if (usersPage.items.some(u => u.email.toLowerCase() === email.toLowerCase())) return bad(c, 'Email already in use');
      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        role: 'client',
        password,
        phone: phone ?? "",
        address: address ?? "",
        city: city ?? "",
        state: state ?? "",
        zip: zip ?? "",
        emergencyName: emergencyName ?? "",
        emergencyPhone: emergencyPhone ?? ""
      };
      const user = await UserEntity.create(c.env, newUser);
      return ok(c, user);
    } catch (e) {
      console.error(`[AUTH] Register error:`, e);
      return bad(c, 'Registration process failed');
    }
  });
  app.get('/api/invoices', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    const page = await InvoiceEntity.list(c.env, c.req.query('cursor'), Number(c.req.query('limit')) || 50);
    if (user.role === 'client') {
      page.items = page.items.filter(inv => inv.ownerId === user.id);
    }
    return ok(c, page);
  });
  app.patch('/api/invoices/:id', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    const id = c.req.param('id');
    const patch = await c.req.json();
    const entity = new InvoiceEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Invoice not found');
    const current = await entity.getState();
    if (user.role === 'client' && current.ownerId !== user.id) return c.json({ success: false, error: 'Forbidden' } as any, 403);
    const updated = await entity.mutate(s => ({ ...s, ...patch }));
    return ok(c, updated);
  });
  app.patch('/api/bookings/:id', async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, error: 'Unauthorized' } as any, 401);
    const id = c.req.param('id');
    const patch = await c.req.json();
    const entity = new BookingEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Booking not found');
    const current = await entity.getState();
    if (user.role === 'client' && current.ownerId !== user.id) return c.json({ success: false, error: 'Forbidden' } as any, 403);
    const updated = await entity.mutate(s => ({ ...s, ...patch }));
    return ok(c, updated);
  });
}