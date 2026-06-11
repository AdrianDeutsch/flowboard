import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { BoardDetail } from '@/lib/types';
import { api } from '@/lib/api';

// The board view talks to the backend for every mutation – mock it away.
jest.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error {},
  api: {
    tasks: { create: jest.fn(), remove: jest.fn(), move: jest.fn() },
    columns: { create: jest.fn(), remove: jest.fn() },
  },
}));

const mockedApi = jest.mocked(api);

function buildBoard(): BoardDetail {
  return {
    id: 'board-1',
    title: 'Launch Plan',
    description: null,
    ownerId: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    columns: [
      {
        id: 'col-1',
        title: 'To Do',
        position: 0,
        boardId: 'board-1',
        tasks: [
          {
            id: 'task-1',
            title: 'Design landing page',
            description: null,
            position: 0,
            columnId: 'col-1',
          },
          { id: 'task-2', title: 'Set up CI', description: null, position: 1, columnId: 'col-1' },
        ],
      },
      { id: 'col-2', title: 'Done', position: 1, boardId: 'board-1', tasks: [] },
    ],
  };
}

describe('KanbanBoard', () => {
  it('renders the board with its columns and tasks', () => {
    render(<KanbanBoard board={buildBoard()} />);

    expect(screen.getByRole('heading', { name: 'Launch Plan' })).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Design landing page')).toBeInTheDocument();
    expect(screen.getByText('Set up CI')).toBeInTheDocument();
  });

  it('shows a drop hint for empty columns', () => {
    render(<KanbanBoard board={buildBoard()} />);
    expect(screen.getByText('Drop tasks here')).toBeInTheDocument();
  });

  it('creates a task via the API and renders it optimistically', async () => {
    mockedApi.tasks.create.mockResolvedValue({
      task: {
        id: 'task-3',
        title: 'Write docs',
        description: null,
        position: 0,
        columnId: 'col-2',
      },
    });

    render(<KanbanBoard board={buildBoard()} />);

    const doneColumn = screen.getByRole('region', { name: 'Column Done' });
    await userEvent.type(screen.getAllByLabelText('New task title …')[1], 'Write docs');
    await userEvent.click(screen.getAllByRole('button', { name: 'Add task' })[1]);

    expect(mockedApi.tasks.create).toHaveBeenCalledWith('col-2', { title: 'Write docs' });
    expect(await screen.findByText('Write docs')).toBeInTheDocument();
    expect(doneColumn).toBeInTheDocument();
  });

  it('removes a task when its delete button is clicked', async () => {
    mockedApi.tasks.remove.mockResolvedValue(undefined);

    render(<KanbanBoard board={buildBoard()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete task Set up CI' }));

    expect(mockedApi.tasks.remove).toHaveBeenCalledWith('task-2');
    expect(screen.queryByText('Set up CI')).not.toBeInTheDocument();
  });

  it('restores the task when deletion fails on the server', async () => {
    mockedApi.tasks.remove.mockRejectedValue(new Error('boom'));

    render(<KanbanBoard board={buildBoard()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete task Set up CI' }));

    expect(await screen.findByText('Set up CI')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Could not delete the task.');
  });
});
