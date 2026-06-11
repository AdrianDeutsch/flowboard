'use client';

import { FormEvent, useState } from 'react';
import { ApiError } from '@/lib/api';

interface AddItemFormProps {
  placeholder: string;
  buttonLabel: string;
  /** Called with the trimmed title; rejections are shown as errors. */
  onAdd: (title: string) => Promise<void>;
}

/** Reusable inline "add item" form used for both columns and tasks. */
export function AddItemForm({ placeholder, buttonLabel, onAdd }: AddItemFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length === 0) return;

    setError(null);
    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setTitle('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <div className="flex gap-1">
        <input
          type="text"
          placeholder={placeholder}
          aria-label={placeholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {buttonLabel}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
