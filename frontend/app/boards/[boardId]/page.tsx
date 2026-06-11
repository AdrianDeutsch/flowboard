'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { BoardDetail } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

/** Board detail page: loads the board and renders the Kanban view. */
export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params);
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.boards
      .get(boardId)
      .then(({ board }) => {
        setBoard(board);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setError('This board does not exist (anymore).');
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load the board.');
        }
      });
  }, [boardId]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <main className="flex-1 overflow-x-auto px-6 py-6">
        {error && (
          <div className="mx-auto max-w-md text-center">
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              Back to dashboard
            </Link>
          </div>
        )}

        {!board && !error && <p className="text-sm text-zinc-500">Loading …</p>}

        {board && <KanbanBoard board={board} />}
      </main>
    </div>
  );
}
