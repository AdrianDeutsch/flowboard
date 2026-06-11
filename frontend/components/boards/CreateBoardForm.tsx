'use client';

import { FormEvent, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Board } from '@/lib/types';

interface CreateBoardFormProps {
  onCreated: (board: Board) => void;
}

/** Inline form to create a new board from the dashboard. */
export function CreateBoardForm({ onCreated }: CreateBoardFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length === 0) {
      setError('Please enter a board title.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const { board } = await api.boards.create({ title: title.trim() });
      setTitle('');
      onCreated(board);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the board.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="New board title …"
        aria-label="New board title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        Create board
      </button>
      {error && (
        <p role="alert" className="self-center text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
