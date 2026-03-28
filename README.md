# Paws and Play

[cloudflarebutton]

A modern full-stack chat application built on Cloudflare Workers. This project demonstrates a scalable, serverless architecture using Durable Objects for real-time chat boards, user management, and message persistence. The frontend is a responsive React app with shadcn/ui components, Tailwind CSS, and TanStack Query for data fetching.

## Features

- **Real-time Chat Boards**: Create and manage chat rooms with persistent messages stored in Durable Objects.
- **User Management**: CRUD operations for users with indexed listing and pagination.
- **Type-Safe API**: Shared TypeScript types between frontend and backend with full API coverage.
- **Responsive UI**: Modern design with dark/light themes, sidebar navigation, and mobile support.
- **Serverless Scaling**: Zero-cold-start Durable Objects, global replication via Cloudflare.
- **Production-Ready**: Error handling, CORS, logging, client error reporting, and automatic seeding.
- **Development Tools**: Hot reload, TypeScript strict mode, ESLint, Tailwind, and Vite bundling.

## Tech Stack

- **Backend**: Cloudflare Workers, Hono, Durable Objects, TypeScript
- **Frontend**: React 18, Vite, TanStack Query, React Router, shadcn/ui, Tailwind CSS
- **UI/UX**: Lucide icons, Framer Motion, Sonner toasts, Radix UI primitives
- **Data**: Indexed entity listing with cursors/limits, JSON storage
- **Dev Tools**: Bun, Wrangler, ESLint, TypeScript 5

## Quick Start

1. **Prerequisites**:
   - [Bun](https://bun.sh) installed
   - [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/installation/) installed
   - Cloudflare account (free tier sufficient)

2. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd paws-and-play-jcp7nax742tlo3ecjyv9l
   bun install
   ```

3. **Generate Worker Types** (one-time):
   ```bash
   bun run cf-typegen
   ```

4. **Development**:
   ```bash
   bun dev
   ```
   Opens at `http://localhost:3000` (frontend) with hot reload. Backend APIs at `/api/*`.

5. **Build & Preview**:
   ```bash
   bun build
   bun preview
   ```

## Usage Examples

### API Endpoints (all `/api/*`)

- **Users**:
  ```bash
  GET /api/users              # List users (paginated)
  POST /api/users             # Create user { "name": "Alice" }
  DELETE /api/users/:id       # Delete user
  POST /api/users/deleteMany  # { "ids": ["id1", "id2"] }
  ```

- **Chats**:
  ```bash
  GET /api/chats              # List chats
  POST /api/chats             # Create { "title": "My Chat" }
  DELETE /api/chats/:id       # Delete chat
  POST /api/chats/deleteMany  # Bulk delete
  ```

- **Messages**:
  ```bash
  GET /api/chats/:chatId/messages     # List messages
  POST /api/chats/:chatId/messages    # Send { "userId": "u1", "text": "Hello" }
  ```

All responses follow `{ success: true, data: T }` or `{ success: false, error: string }`.

### Frontend Customization

- Edit `src/pages/HomePage.tsx` for your main app.
- Use `src/lib/api-client.ts` for type-safe API calls: `api<User[]>('/api/users')`.
- Add routes in `src/main.tsx`.
- Components in `src/components/ui/*` (shadcn) and hooks ready to use.

## Development Workflow

- **Frontend**: `src/` – Vite + React. Edit pages/components, auto-reloads.
- **Backend**: `worker/` – Hono routes in `user-routes.ts`. Entities in `entities.ts`.
- **Shared Types**: `shared/types.ts` – Auto-synced between FE/BE.
- **Seeding**: Mock data auto-seeds on first `/api/users` or `/api/chats` call.
- **Linting**: `bun lint`
- **Error Reporting**: Client errors auto-logged to worker console via `/api/client-errors`.

**Pro Tip**: Durable Objects provide per-entity isolation – scale to millions without sharding.

## Deployment

1. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Deploy** (builds frontend assets + deploys worker):
   ```bash
   bun deploy
   ```

3. **Custom Domain** (optional):
   Edit `wrangler.jsonc` and run `wrangler deploy`.

One-click deploy:

[cloudflarebutton]

**Customizations**:
- Update `wrangler.jsonc` for bindings/migrations.
- Assets served as Pages (SPA fallback).
- Durable Objects auto-migrate via `migrations`.

## License

MIT – feel free to fork, modify, and deploy!