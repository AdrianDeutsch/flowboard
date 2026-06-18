# Flowboard – Frontend

Next.js (App Router) + React + Tailwind CSS + TypeScript. Kanban drag & drop via dnd-kit.

## Setup

```bash
npm install
cp .env.local.example .env.local   # points to the backend (default :4000)
npm run dev                        # http://localhost:3000
```

The backend must be running for login and data – see `../backend/README.md`.

## Scripts

| Script           | Purpose                          |
| ---------------- | -------------------------------- |
| `npm run dev`    | Dev server                       |
| `npm test`       | Jest + React Testing Library     |
| `npm run build`  | Production build                 |
| `npm run lint`   | ESLint                           |
| `npm run format` | Prettier                         |

## Project structure

```
frontend/
├── app/
│   ├── login/ & register/         # public auth pages
│   ├── dashboard/                 # board overview (CRUD)
│   └── boards/[boardId]/          # Kanban board view
├── components/
│   ├── auth/AuthForm.tsx          # shared login/register form
│   ├── boards/                    # BoardCard, CreateBoardForm
│   ├── kanban/                    # KanbanBoard (dnd-kit), ColumnContainer,
│   │                              # TaskCard, AddItemForm
│   └── layout/Header.tsx
├── lib/
│   ├── api.ts                     # typed fetch client (credentials: include)
│   └── types.ts                   # shared entity types
├── middleware.ts                  # cookie-based route protection
└── tests/                         # RTL tests (AuthForm, KanbanBoard)
```

## Architecture notes

- **Auth:** the JWT lives in an httpOnly cookie set by the backend; the
  middleware only checks cookie presence for redirects, verification
  happens server-side on every API call.
- **Drag & drop:** optimistic UI updates with rollback – moves are applied
  to local state instantly and reverted if the `PATCH /tasks/:id/move`
  call fails.
