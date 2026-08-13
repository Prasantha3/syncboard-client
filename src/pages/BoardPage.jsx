import { useMemo, useState } from 'react'
import Column from '../components/Column/Column'
import TaskCard from '../components/TaskCard/TaskCard'
import AddTaskForm from '../components/AddTaskForm/AddTaskForm'
import FilterBar from '../components/FilterBar/FilterBar'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import Spinner from '../components/StatusViews/Spinner'
import ErrorBanner from '../components/StatusViews/ErrorBanner'
import EmptyState from '../components/StatusViews/EmptyState'
import { useTasks } from '../hooks/useTasks'
import { useFilters } from '../hooks/useFilters'
import styles from './BoardPage.module.css'

const COLUMNS = [
  { status: 'todo', title: 'To Do' },
  { status: 'doing', title: 'In Progress' },
  { status: 'done', title: 'Done' },
]

export default function BoardPage() {
  const { tasks, loading, error, addTask, moveTask, removeTask } = useTasks()
  const { assignee, status, query } = useFilters()
  const [pendingDelete, setPendingDelete] = useState(null)

  const assignees = useMemo(
    () => [...new Set(tasks.map(t => t.assignee).filter(Boolean))].sort(),
    [tasks]
  )

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (status && t.status !== status) return false
      if (assignee && t.assignee !== assignee) return false
      if (query && !t.title.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [tasks, status, assignee, query])

  if (loading) return <Spinner label="Loading your board…" />
  if (error) return <ErrorBanner message={error} />

  return (
    <div>
      <AddTaskForm onAdd={addTask} />
      <FilterBar assignees={assignees} />

      {tasks.length === 0 ? (
        <EmptyState label="No tasks yet" hint="Add your first task above to get started." />
      ) : (
        <div className={styles.board}>
          {COLUMNS.map(col => {
            const columnTasks = filteredTasks.filter(t => t.status === col.status)
            return (
              <Column key={col.status} title={col.title} count={columnTasks.length}>
                {columnTasks.length === 0 ? (
                  <EmptyState label="No matching tasks" />
                ) : (
                  columnTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onMove={moveTask}
                      onDeleteRequest={setPendingDelete}
                    />
                  ))
                )}
              </Column>
            )
          })}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          message={`Delete "${pendingDelete.title}"? This cannot be undone.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            removeTask(pendingDelete.id)
            setPendingDelete(null)
          }}
        />
      )}
    </div>
  )
}
