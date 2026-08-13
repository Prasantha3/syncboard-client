import { createContext, useEffect, useReducer, useState, useCallback } from 'react'
import { getTasks, createTask, updateTaskStatus, deleteTask } from '../api/tasks'
import { tasksReducer, initialTasksState } from './tasksReducer'

export const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasksState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getTasks()
      .then(data => {
        if (!cancelled) dispatch({ type: 'loaded', tasks: data })
      })
      .catch(err => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // A component never calls the api module directly — only these actions do.
  const addTask = useCallback(async draft => {
    const task = await createTask(draft)
    dispatch({ type: 'added', task })
    return task
  }, [])

  const moveTask = useCallback(async (id, status) => {
    await updateTaskStatus(id, status)
    dispatch({ type: 'moved', id, status })
  }, [])

  const removeTask = useCallback(async id => {
    await deleteTask(id)
    dispatch({ type: 'deleted', id })
  }, [])

  const value = { tasks, loading, error, addTask, moveTask, removeTask }

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}
