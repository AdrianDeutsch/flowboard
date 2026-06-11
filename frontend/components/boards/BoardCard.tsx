'use client';

import Link from 'next/link';
import { Board } from '@/lib/types';

interface BoardCardProps {
  board: Board;
  onDelete: (boardId: string) => void;
}

/** Dashboard tile linking to the board, with a delete action. */
export function BoardCard({ board, onDelete }: BoardCardProps) {
  return (
    <div className="group relative rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link href={`/boards/${board.id}`} className="block">
        <h2 className="font-semibold text-zinc-900">{board.title}</h2>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm text-zinc-500">
          {board.description ?? 'No description'}
        </p>
      </Link>
      <button
        aria-label={`Delete board ${board.title}`}
        onClick={() => onDelete(board.id)}
        className="absolute right-3 top-3 hidden rounded-md px-2 py-1 text-xs text-zinc-400 transition hover:bg-red-50 hover:text-red-600 group-hover:block"
      >
        Delete
      </button>
    </div>
  );
}
