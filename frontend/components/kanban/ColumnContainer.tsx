'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnWithTasks } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { AddItemForm } from './AddItemForm';

interface ColumnContainerProps {
  column: ColumnWithTasks;
  onAddTask: (columnId: string, title: string) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

/**
 * One Kanban column: droppable area + sortable list of its tasks.
 * The column itself is a drop target so tasks can be dropped into
 * empty columns.
 */
export function ColumnContainer({
  column,
  onAddTask,
  onDeleteTask,
  onDeleteColumn,
}: ColumnContainerProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <section
      ref={setNodeRef}
      aria-label={`Column ${column.title}`}
      className="flex w-72 shrink-0 flex-col rounded-xl bg-zinc-100 p-3"
    >
      <header className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-zinc-700">
          {column.title}
          <span className="ml-2 text-xs font-normal text-zinc-400">{column.tasks.length}</span>
        </h2>
        <button
          aria-label={`Delete column ${column.title}`}
          onClick={() => onDeleteColumn(column.id)}
          className="rounded px-1.5 text-xs text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
        >
          ✕
        </button>
      </header>

      <SortableContext
        items={column.tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-10 flex-col gap-2">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
          ))}
          {column.tasks.length === 0 && (
            <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-center text-xs text-zinc-400">
              Drop tasks here
            </p>
          )}
        </div>
      </SortableContext>

      <div className="mt-3">
        <AddItemForm
          placeholder="New task title …"
          buttonLabel="Add task"
          onAdd={(title) => onAddTask(column.id, title)}
        />
      </div>
    </section>
  );
}
