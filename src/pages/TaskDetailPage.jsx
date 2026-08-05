import { Link, useParams } from 'react-router-dom'
import Spinner from '../components/StatusViews/Spinner'
import ErrorBanner from '../components/StatusViews/ErrorBanner'
import EmptyState from '../components/StatusViews/EmptyState'
import { useTasks } from '../hooks/useTasks'
import styles from './TaskDetailPage.module.css'

const STATUS_LABEL = { todo: 'To Do', doing: 'In Progress', done: 'Done' }

export default function TaskDetailPage() {
  const { id } = useParams()
  const { tasks, loading, error } = useTasks()

  if (loading) return <Spinner label="Loading task…" />
  if (error) return <ErrorBanner message={error} />

  const task = tasks.find(t => t.id === id)

  if (!task) {
    return (
      <div>
        <EmptyState
          label="Task not found"
          hint={`No task exists with id "${id}". It may have been deleted.`}
        />
        <p className={styles.backLink}>
          <Link to="/">← Back to board</Link>
        </p>
      </div>
    )
  }

  return (
    <article className={styles.detail}>
      <p className={styles.backLink}>
        <Link to="/">← Back to board</Link>
      </p>
      <h1>{task.title}</h1>
      <dl className={styles.meta}>
        <dt>Status</dt>
        <dd>{STATUS_LABEL[task.status] || task.status}</dd>
        <dt>Assignee</dt>
        <dd>{task.assignee || 'Unassigned'}</dd>
        <dt>Due date</dt>
        <dd>{task.dueDate || 'No date set'}</dd>
      </dl>
    </article>
  )
}
