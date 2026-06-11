'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => void;
  /** Render-only mode for the DragOverlay (no sortable wiring). */
  overlay?: boolean;
}

/** A single draggable task card. */
export function TaskCard({ task, onDelete, overlay = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: overlay,
  });

  const style = overlay
    ? undefined
    : { transform: CSS.Transform.toString(transform), transition };

  return (
    <article
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      className={`group rounded-lg border border-zinc-200 bg-white p-3 shadow-sm ${isDragging ? 'opacity-40' : ''} ${overlay ? 'rotate-2 shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-800">{task.title}</h3>
        {onDelete && (
          <button
            aria-label={`Delete task ${task.title}`}
            // Stop the pointer event so deleting never starts a drag.
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(task.id)}
            className="hidden rounded px-1 text-xs text-zinc-400 transition hover:bg-red-50 hover:text-red-600 group-hover:block"
          >
            ✕
          </button>
        )}
      </div>
      {task.description && <p className="mt-1 text-xs text-zinc-500">{task.description}</p>}
    </article>
  );
}
