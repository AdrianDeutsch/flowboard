/**
 * Shared API entity types, mirroring the backend's Prisma models
 * (minus server-only fields like passwordHash).
 */

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Board {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface BoardDetail extends Board {
  columns: ColumnWithTasks[];
}
