import { Board, BoardDetail, Column, Task, User } from './types';

// Requests go to this app's own origin and are proxied to the backend via the
// rewrite in next.config (BFF pattern). Keeping calls same-origin means the
// httpOnly auth cookie stays first-party, so sameSite=lax remains valid in
// production. Defaults to a relative base; override only for direct API access.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

/** Error thrown for failed API calls; `status` 0 means network failure. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Thin typed fetch wrapper.
 * Always sends credentials so the httpOnly auth cookie travels along,
 * normalizes error responses and surfaces network failures as ApiError(0).
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new ApiError(0, 'Network error – please check your connection and try again.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? 'Something went wrong.');
  }
  return data as T;
}

const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });
const patch = (body: unknown): RequestInit => ({ method: 'PATCH', body: JSON.stringify(body) });

/** All backend endpoints, grouped and fully typed. */
export const api = {
  auth: {
    register: (input: { email: string; password: string; name: string }) =>
      request<{ user: User }>('/auth/register', post(input)),
    login: (input: { email: string; password: string }) =>
      request<{ user: User }>('/auth/login', post(input)),
    logout: () => request<void>('/auth/logout', { method: 'POST' }),
    me: () => request<{ user: User }>('/auth/me'),
  },
  boards: {
    list: () => request<{ boards: Board[] }>('/boards'),
    create: (input: { title: string; description?: string }) =>
      request<{ board: Board }>('/boards', post(input)),
    get: (boardId: string) => request<{ board: BoardDetail }>(`/boards/${boardId}`),
    update: (boardId: string, input: { title?: string; description?: string }) =>
      request<{ board: Board }>(`/boards/${boardId}`, patch(input)),
    remove: (boardId: string) => request<void>(`/boards/${boardId}`, { method: 'DELETE' }),
  },
  columns: {
    create: (boardId: string, input: { title: string }) =>
      request<{ column: Column }>(`/boards/${boardId}/columns`, post(input)),
    update: (columnId: string, input: { title: string }) =>
      request<{ column: Column }>(`/columns/${columnId}`, patch(input)),
    remove: (columnId: string) => request<void>(`/columns/${columnId}`, { method: 'DELETE' }),
  },
  tasks: {
    create: (columnId: string, input: { title: string; description?: string }) =>
      request<{ task: Task }>(`/columns/${columnId}/tasks`, post(input)),
    update: (taskId: string, input: { title?: string; description?: string }) =>
      request<{ task: Task }>(`/tasks/${taskId}`, patch(input)),
    remove: (taskId: string) => request<void>(`/tasks/${taskId}`, { method: 'DELETE' }),
    /** Persists a drag & drop move (target column + zero-based index). */
    move: (taskId: string, input: { targetColumnId: string; position: number }) =>
      request<{ task: Task }>(`/tasks/${taskId}/move`, patch(input)),
  },
};
