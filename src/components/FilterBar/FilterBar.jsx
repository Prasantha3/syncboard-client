import { useFilters } from '../../hooks/useFilters'
import styles from './FilterBar.module.css'

export default function FilterBar({ assignees }) {
  const { assignee, status, query, setAssignee, setStatus, setQuery } = useFilters()

  return (
    <div className={styles.bar}>
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by title…"
        className={styles.search}
        aria-label="Search by title"
      />

      <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter by status">
        <option value="">All statuses</option>
        <option value="todo">To Do</option>
        <option value="doing">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select value={assignee} onChange={e => setAssignee(e.target.value)} aria-label="Filter by assignee">
        <option value="">All assignees</option>
        {assignees.map(name => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
