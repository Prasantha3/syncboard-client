// Pure function, no React, no DOM — trivially unit-testable in Session 4.
export function validateTaskDraft({ title, dueDate }) {
  const errors = {}

  const trimmedTitle = (title || '').trim()
  if (!trimmedTitle) {
    errors.title = 'Title is required.'
  } else if (trimmedTitle.length < 3) {
    errors.title = 'Title must be at least 3 characters.'
  }

  if (dueDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    if (due < today) {
      errors.dueDate = 'Due date cannot be in the past.'
    }
  }

  return errors
}

export function isValidDraft(errors) {
  return Object.keys(errors).length === 0
}
