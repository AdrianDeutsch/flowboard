'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Board } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { BoardCard } from '@/components/boards/BoardCard';
import { CreateBoardForm } from '@/components/boards/CreateBoardForm';

/** Dashboard: lists the user's boards with create/delete actions. */
export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.boards
      .list()
      .then(({ boards }) => {
        setBoards(boards);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load boards.');
      });
  }, []);

  function handleCreated(board: Board) {
    setBoards((prev) => [board, ...(prev ?? [])]);
  }

  async function handleDelete(boardId: string) {
    // Optimistic removal; reload on failure to restore consistency.
    const previous = boards;
    setBoards((prev) => prev?.filter((b) => b.id !== boardId) ?? null);
    try {
      await api.boards.remove(boardId);
    } catch {
      setBoards(previous ?? null);
      setError('Could not delete the board. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900">Your boards</h1>
        </div>

        <CreateBoardForm onCreated={handleCreated} />

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {boards === null && !error && <p className="mt-8 text-sm text-zinc-500">Loading …</p>}

        {boards?.length === 0 && (
          <p className="mt-8 text-sm text-zinc-500">
            No boards yet – create your first one above.
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards?.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={handleDelete} />
          ))}
        </div>
      </main>
    </div>
  );
}
