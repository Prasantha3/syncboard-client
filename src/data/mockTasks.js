// Stand-in for the database until MongoDB arrives in Session 3.
// Stable string ids (not array index) so keys survive reordering — see Session 1, slide 22.

export const mockTasks = [
  {
    id: 'a1b2c3d4',
    title: 'Design the login screen',
    assignee: 'Nimali',
    status: 'todo',
    dueDate: '2026-08-10',
  },
  {
    id: 'b2c3d4e5',
    title: 'Set up ESLint + Prettier',
    assignee: 'Kavindu',
    status: 'todo',
    dueDate: '2026-08-08',
  },
  {
    id: 'c3d4e5f6',
    title: 'Sketch the board wireframe',
    assignee: 'Nimali',
    status: 'todo',
    dueDate: '2026-08-09',
  },
  {
    id: 'd4e5f6a7',
    title: 'Build the TaskCard component',
    assignee: 'Ishara',
    status: 'doing',
    dueDate: '2026-08-11',
  },
  {
    id: 'e5f6a7b8',
    title: 'Wire up React Router',
    assignee: 'Kavindu',
    status: 'doing',
    dueDate: '2026-08-12',
  },
  {
    id: 'f6a7b8c9',
    title: 'Write the AddTaskForm validation',
    assignee: 'Ishara',
    status: 'doing',
    dueDate: '2026-08-07',
  },
  {
    id: 'a7b8c9d0',
    title: 'Scaffold project with Vite',
    assignee: 'Kavindu',
    status: 'done',
    dueDate: '2026-08-02',
  },
  {
    id: 'b8c9d0e1',
    title: 'Agree on folder structure',
    assignee: 'Nimali',
    status: 'done',
    dueDate: '2026-08-02',
  },
  {
    id: 'c9d0e1f2',
    title: 'Create shared Button component',
    assignee: 'Ishara',
    status: 'done',
    dueDate: '2026-08-03',
  },
  {
    id: 'd0e1f2a3',
    title: 'Draft README structure',
    assignee: 'Nimali',
    status: 'done',
    dueDate: '2026-08-03',
  },
]
