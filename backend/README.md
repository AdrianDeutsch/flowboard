# SaaS-Light – Backend

Express + TypeScript + Prisma (PostgreSQL) API with JWT authentication via httpOnly cookies.

## Setup

```bash
npm install
cp .env.example .env           # adjust DATABASE_URL & JWT_SECRET
npx prisma migrate dev         # creates the database schema
npm run dev                    # starts the API on http://localhost:4000
```

## Scripts

| Script                | Purpose                              |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Dev server with hot reload (tsx)     |
| `npm test`            | Jest + Supertest (DB is mocked)      |
| `npm run build`       | Compile to `dist/`                   |
| `npm run lint`        | ESLint                               |
| `npm run format`      | Prettier                             |
| `npm run prisma:migrate` | Prisma migration (dev)            |

## Project structure

```
backend/
├── prisma/
│   └── schema.prisma          # User, Board, Column, Task
├── src/
│   ├── index.ts               # server entry point + graceful shutdown
│   ├── app.ts                 # express app factory (CORS, routers, errors)
│   ├── config/env.ts          # zod-validated environment
│   ├── lib/prisma.ts          # PrismaClient singleton
│   ├── errors/HttpError.ts    # typed HTTP errors
│   ├── middleware/            # requireAuth, validateBody, errorHandler
│   └── modules/               # feature modules: router + service + schemas
│       ├── auth/
│       ├── boards/
│       ├── columns/
│       └── tasks/
└── tests/                     # Jest + Supertest (Prisma deep-mocked)
```

## API overview

| Method | Route                          | Description                      |
| ------ | ------------------------------ | -------------------------------- |
| POST   | `/api/auth/register`           | Create account, sets auth cookie |
| POST   | `/api/auth/login`              | Login, sets auth cookie          |
| POST   | `/api/auth/logout`             | Clears the auth cookie           |
| GET    | `/api/auth/me`                 | Current user                     |
| GET    | `/api/boards`                  | List own boards                  |
| POST   | `/api/boards`                  | Create board                     |
| GET    | `/api/boards/:id`              | Board incl. columns + tasks      |
| PATCH  | `/api/boards/:id`              | Update board                     |
| DELETE | `/api/boards/:id`              | Delete board (cascades)          |
| POST   | `/api/boards/:id/columns`      | Create column                    |
| PATCH  | `/api/columns/:id`             | Rename column                    |
| DELETE | `/api/columns/:id`             | Delete column                    |
| POST   | `/api/columns/:id/tasks`       | Create task                      |
| PATCH  | `/api/tasks/:id`               | Update task                      |
| PATCH  | `/api/tasks/:id/move`          | Move task (drag & drop)          |
| DELETE | `/api/tasks/:id`               | Delete task                      |

All routes except register/login/logout require the `auth_token` httpOnly cookie.
