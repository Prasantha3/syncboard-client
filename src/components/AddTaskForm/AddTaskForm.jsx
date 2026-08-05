import { useState } from 'react'
import Button from '../Button/Button'
import { validateTaskDraft, isValidDraft } from '../../utils/validate'
import styles from './AddTaskForm.module.css'

const initialDraft = { title: '', assignee: '', dueDate: '' }

export default function AddTaskForm({ onAdd }) {
  const [draft, setDraft] = useState(initialDraft)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function handleChange(field, value) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validateTaskDraft(draft)
    setErrors(validationErrors)
    if (!isValidDraft(validationErrors)) return

    setSubmitting(true)
    try {
      await onAdd({ ...draft, title: draft.title.trim() })
      setDraft(initialDraft)
      setErrors({})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={draft.title}
          onChange={e => handleChange('title', e.target.value)}
          placeholder="e.g. Write the API contract"
        />
        {errors.title && <p className={styles.error}>{errors.title}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="assignee">Assignee</label>
        <input
          id="assignee"
          type="text"
          value={draft.assignee}
          onChange={e => handleChange('assignee', e.target.value)}
          placeholder="Optional"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="dueDate">Due date</label>
        <input
          id="dueDate"
          type="date"
          value={draft.dueDate}
          onChange={e => handleChange('dueDate', e.target.value)}
        />
        {errors.dueDate && <p className={styles.error}>{errors.dueDate}</p>}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add task'}
      </Button>
    </form>
  )
}
