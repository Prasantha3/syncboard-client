import { Link } from 'react-router-dom'
import Button from '../Button/Button'
import styles from './TaskCard.module.css'

const STATUS_ORDER = ['todo', 'doing', 'done']

export default function TaskCard({ task, onMove, onDeleteRequest }) {
  const index = STATUS_ORDER.indexOf(task.status)
  const canMoveLeft = index > 0
  const canMoveRight = index < STATUS_ORDER.length - 1

  return (
    <article className={styles.card}>
      <Link to={`/tasks/${task.id}`} className={styles.title}>
        {task.title}
      </Link>
      <p className={styles.meta}>
        {task.assignee || 'Unassigned'} · Due {task.dueDate || 'no date'}
      </p>
      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          disabled={!canMoveLeft}
          onClick={() => onMove(task.id, STATUS_ORDER[index - 1])}
          aria-label="Move left"
        >
          ←
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!canMoveRight}
          onClick={() => onMove(task.id, STATUS_ORDER[index + 1])}
          aria-label="Move right"
        >
          →
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDeleteRequest(task)}
        >
          Delete
        </Button>
      </div>
    </article>
  )
}
