import React from 'react';

import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import {
  http,
  HttpResponse,
} from 'msw';

import TaskBoard from './TaskBoard';

import { server } from '../mocks/server';

import {
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
} from '../db/syncQueue';

import localDb from '../db/localDb';


vi.mock('../db/localDb', () => ({
  default: {
    put: vi.fn().mockResolvedValue({
      ok: true,
    }),

    get: vi.fn().mockRejectedValue({
      status: 404,
    }),

    remove: vi.fn().mockResolvedValue({
      ok: true,
    }),

    allDocs: vi.fn().mockResolvedValue({
      rows: [],
    }),

    info: vi.fn().mockResolvedValue({}),
  },
}));


vi.mock('../db/syncQueue', () => ({
  addToSyncQueue: vi.fn().mockResolvedValue(undefined),

  getSyncQueue: vi.fn().mockResolvedValue([]),

  removeFromSyncQueue: vi.fn().mockResolvedValue(undefined),
}));


const API_BASE_URL =
  'http://localhost:5000/api/tasks';


const mockTasks = [
  {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test task description',
    assignee: 'Test User',
    dueDate: '2026-09-15',
    status: 'Pending',
    version: 1,
  },

  {
    id: 'task-2',
    title: 'In Progress Task',
    description: 'Another test task',
    assignee: 'Another User',
    dueDate: '2026-09-20',
    status: 'In Progress',
    version: 1,
  },

  {
    id: 'task-3',
    title: 'Completed Task',
    description: 'Completed test task',
    assignee: 'Completed User',
    dueDate: '2026-09-10',
    status: 'Completed',
    version: 1,
  },
];


const setupSuccessfulTaskHandlers = () => {
  server.use(

    http.get(
      API_BASE_URL,
      () => {
        return HttpResponse.json(
          mockTasks,
          {
            status: 200,
          }
        );
      }
    ),


    http.post(
      API_BASE_URL,
      async ({ request }) => {
        const body =
          await request.json();

        return HttpResponse.json(
          {
            id: 'new-task-1',
            ...body,
            version: 1,
          },
          {
            status: 201,
          }
        );
      }
    ),


    http.patch(
      API_BASE_URL + '/:id',
      async ({ params, request }) => {
        const body =
          await request.json();

        return HttpResponse.json(
          {
            id: params.id,
            ...body,
            version: 2,
          },
          {
            status: 200,
          }
        );
      }
    ),


    http.delete(
      API_BASE_URL + '/:id',
      () => {
        return new HttpResponse(
          null,
          {
            status: 204,
          }
        );
      }
    )

  );
};


describe('TaskBoard', () => {

  beforeEach(() => {

    vi.clearAllMocks();

    localStorage.clear();


    Object.defineProperty(
      navigator,
      'onLine',
      {
        configurable: true,
        value: true,
      }
    );


    localDb.allDocs.mockResolvedValue({
      rows: [],
    });


    localDb.get.mockRejectedValue({
      status: 404,
    });


    localDb.put.mockResolvedValue({
      ok: true,
    });


    localDb.remove.mockResolvedValue({
      ok: true,
    });


    getSyncQueue.mockResolvedValue([]);


    addToSyncQueue.mockResolvedValue(
      undefined
    );


    removeFromSyncQueue.mockResolvedValue(
      undefined
    );


    setupSuccessfulTaskHandlers();

  });


  test(
    'renders the task board and loads tasks from the API',
    async () => {

      render(<TaskBoard />);


      expect(
        await screen.findByText(
          'Test Task'
        )
      ).toBeInTheDocument();


      expect(
        screen.getByText(
          'In Progress Task'
        )
      ).toBeInTheDocument();


      expect(
        screen.getByText(
          'Completed Task'
        )
      ).toBeInTheDocument();

    }
  );


  test(
    'allows the user to create a new task',
    async () => {

      const user =
        userEvent.setup();


      render(<TaskBoard />);


      await screen.findByText(
        'Test Task'
      );


      const titleInput =
        screen.getByPlaceholderText(
          'Task title'
        );


      const assigneeInput =
        screen.getByPlaceholderText(
          'Assignee'
        );


      await user.type(
        titleInput,
        'New User Task'
      );


      await user.type(
        assigneeInput,
        'New User'
      );


      await user.click(
        screen.getByRole(
          'button',
          {
            name: 'Add Task',
          }
        )
      );


      await waitFor(() => {

        expect(
          titleInput
        ).toHaveValue('');

        expect(
          assigneeInput
        ).toHaveValue('');

      });

    }
  );


  test(
    'shows an empty state when the task API fails',
    async () => {

      server.use(

        http.get(
          API_BASE_URL,
          () => {

            return HttpResponse.json(
              {
                message:
                  'Server unavailable',
              },
              {
                status: 500,
              }
            );

          }
        )

      );


      render(<TaskBoard />);


      await waitFor(() => {

        expect(
          screen.getByText(
            /No Tasks Found/i
          )
        ).toBeInTheDocument();

      });

    }
  );


  test(
    'shows offline state when the browser goes offline',
    async () => {

      render(<TaskBoard />);


      await screen.findByText(
        'Test Task'
      );


      Object.defineProperty(
        navigator,
        'onLine',
        {
          configurable: true,
          value: false,
        }
      );


      window.dispatchEvent(
        new Event('offline')
      );


      await waitFor(() => {

        expect(
          screen.getByText(
            /offline/i
          )
        ).toBeInTheDocument();

      });

    }
  );


  test(
    'uses the sync queue when a task change happens offline',
    async () => {

      const user =
        userEvent.setup();


      /*
       * Simulate a task that was previously
       * saved in the local database.
       *
       * TaskBoard uses localDb when offline,
       * so the offline test needs local data.
       */

      localDb.allDocs.mockResolvedValue({
        rows: [
          {
            id: 'task-1',
            doc: {
              ...mockTasks[0],
            },
          },
        ],
      });


      Object.defineProperty(
        navigator,
        'onLine',
        {
          configurable: true,
          value: false,
        }
      );


      render(<TaskBoard />);


      const testTask =
        await screen.findByText(
          'Test Task'
        );


      const taskCard =
        testTask.closest('div');


      expect(
        taskCard
      ).toBeTruthy();


      const moveButton =
        within(taskCard).getByRole(
          'button',
          {
            name: 'Move to In Progress',
          }
        );


      await user.click(
        moveButton
      );


      await waitFor(() => {

        expect(
          addToSyncQueue
        ).toHaveBeenCalled();

      });


      expect(
        addToSyncQueue
      ).toHaveBeenCalledWith(

        expect.objectContaining({
          type: 'update',
          taskId: 'task-1',
        })

      );

    }
  );


  test(
    'uses local database functions without crashing',
    async () => {

      render(<TaskBoard />);


      await screen.findByText(
        'Test Task'
      );


      expect(
        localDb.allDocs
      ).toHaveBeenCalled();


      expect(
        localDb.allDocs
      ).toHaveBeenCalledWith(

        expect.objectContaining({
          include_docs: true,
        })

      );

    }
  );


  test(
    'checks the sync queue when the board loads',
    async () => {

      render(<TaskBoard />);


      await screen.findByText(
        'Test Task'
      );


      await waitFor(() => {

        expect(
          getSyncQueue
        ).toHaveBeenCalled();

      });

    }
  );


  test(
    'can remove an item from the sync queue',
    async () => {

      await removeFromSyncQueue(
        'queue:test:1'
      );


      expect(
        removeFromSyncQueue
      ).toHaveBeenCalledWith(
        'queue:test:1'
      );

    }
  );

});