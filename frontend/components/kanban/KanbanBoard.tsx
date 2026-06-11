'use client';

import { useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { api } from '@/lib/api';
import { BoardDetail, ColumnWithTasks, Task } from '@/lib/types';
import { ColumnContainer } from './ColumnContainer';
import { TaskCard } from './TaskCard';
import { AddItemForm } from './AddItemForm';

interface KanbanBoardProps {
  board: BoardDetail;
}

/**
 * Interactive Kanban view with drag & drop.
 *
 * Strategy: all moves are applied optimistically to local state for a
 * fluid UX, then persisted via the API. On failure the state is rolled
 * back to the snapshot taken when the drag started.
 */
export function KanbanBoard({ board }: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnWithTasks[]>(board.columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Snapshot of the column state before the current drag, for rollback.
  const dragSnapshot = useRef<ColumnWithTasks[] | null>(null);

  // The 8px activation distance keeps plain clicks (e.g. on buttons
  // inside a card) from starting a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const isColumnId = (id: string) => columns.some((column) => column.id === id);

  const findColumnByTaskId = (taskId: string) =>
    columns.find((column) => column.tasks.some((task) => task.id === taskId));

  function handleDragStart(event: DragStartEvent) {
    dragSnapshot.current = columns;
    const column = findColumnByTaskId(String(event.active.id));
    setActiveTask(column?.tasks.find((task) => task.id === String(event.active.id)) ?? null);
  }

  /**
   * Moves the task between columns *while dragging* so dnd-kit can show
   * live insertion previews across columns.
   */
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const sourceColumn = findColumnByTaskId(activeId);
    const targetColumn = isColumnId(overId)
      ? columns.find((column) => column.id === overId)
      : findColumnByTaskId(overId);

    if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id) return;

    setColumns((prev) => {
      const task = prev
        .find((column) => column.id === sourceColumn.id)
        ?.tasks.find((t) => t.id === activeId);
      if (!task) return prev;

      const overTasks = prev.find((column) => column.id === targetColumn.id)?.tasks ?? [];
      const overIndex = isColumnId(overId)
        ? overTasks.length
        : overTasks.findIndex((t) => t.id === overId);

      return prev.map((column) => {
        if (column.id === sourceColumn.id) {
          return { ...column, tasks: column.tasks.filter((t) => t.id !== activeId) };
        }
        if (column.id === targetColumn.id) {
          const tasks = [...column.tasks];
          tasks.splice(overIndex < 0 ? tasks.length : overIndex, 0, {
            ...task,
            columnId: targetColumn.id,
          });
          return { ...column, tasks };
        }
        return column;
      });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const snapshot = dragSnapshot.current;
    dragSnapshot.current = null;

    const { active, over } = event;
    if (!over) {
      if (snapshot) setColumns(snapshot);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    // After handleDragOver the task already sits in its target column.
    const column = findColumnByTaskId(activeId);
    if (!column || !snapshot) return;

    const oldIndex = column.tasks.findIndex((task) => task.id === activeId);
    const overIndex =
      overId === column.id ? column.tasks.length - 1 : column.tasks.findIndex((t) => t.id === overId);
    const newIndex = overIndex < 0 ? oldIndex : overIndex;

    const reordered = arrayMove(column.tasks, oldIndex, newIndex).map((task, position) => ({
      ...task,
      position,
    }));
    setColumns((prev) =>
      prev.map((c) => (c.id === column.id ? { ...c, tasks: reordered } : c)),
    );

    // Skip the API call when the task ended up exactly where it started.
    const originColumn = snapshot.find((c) => c.tasks.some((t) => t.id === activeId));
    const originIndex = originColumn?.tasks.findIndex((t) => t.id === activeId) ?? -1;
    if (originColumn?.id === column.id && originIndex === newIndex) return;

    void persistMove(activeId, column.id, newIndex, snapshot);
  }

  async function persistMove(
    taskId: string,
    targetColumnId: string,
    position: number,
    snapshot: ColumnWithTasks[],
  ) {
    try {
      setError(null);
      await api.tasks.move(taskId, { targetColumnId, position });
    } catch {
      // Roll back the optimistic update so UI and server stay in sync.
      setColumns(snapshot);
      setError('Could not save the move – your change was undone.');
    }
  }

  async function handleAddColumn(title: string) {
    const { column } = await api.columns.create(board.id, { title });
    setColumns((prev) => [...prev, { ...column, tasks: [] }]);
  }

  async function handleDeleteColumn(columnId: string) {
    const previous = columns;
    setColumns((prev) => prev.filter((column) => column.id !== columnId));
    try {
      await api.columns.remove(columnId);
    } catch {
      setColumns(previous);
      setError('Could not delete the column.');
    }
  }

  async function handleAddTask(columnId: string, title: string) {
    const { task } = await api.tasks.create(columnId, { title });
    setColumns((prev) =>
      prev.map((column) =>
        column.id === columnId ? { ...column, tasks: [...column.tasks, task] } : column,
      ),
    );
  }

  async function handleDeleteTask(taskId: string) {
    const previous = columns;
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      })),
    );
    try {
      await api.tasks.remove(taskId);
    } catch {
      setColumns(previous);
      setError('Could not delete the task.');
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-zinc-900">{board.title}</h1>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-4">
          {columns.map((column) => (
            <ColumnContainer
              key={column.id}
              column={column}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onDeleteColumn={handleDeleteColumn}
            />
          ))}

          <div className="w-72 shrink-0">
            <AddItemForm placeholder="New column title …" buttonLabel="Add column" onAdd={handleAddColumn} />
          </div>
        </div>

        {/* Renders the dragged card under the pointer, above everything. */}
        <DragOverlay>{activeTask && <TaskCard task={activeTask} overlay />}</DragOverlay>
      </DndContext>
    </div>
  );
}
