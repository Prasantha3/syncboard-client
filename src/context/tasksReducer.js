// Pure reducer — easiest thing in the project to unit test in Session 4.
// In Session 5, an incoming WebSocket message will dispatch these exact same
// actions instead of a local click, so real-time sync slots straight in.
export function tasksReducer(state, action) {
  switch (action.type) {
    case 'loaded':
      return action.tasks
    case 'added':
      return [...state, action.task]
    case 'moved':
      return state.map(t =>
        t.id === action.id ? { ...t, status: action.status } : t
      )
    case 'deleted':
      return state.filter(t => t.id !== action.id)
    default:
      throw new Error('Unknown action: ' + action.type)
  }
}

export const initialTasksState = []
