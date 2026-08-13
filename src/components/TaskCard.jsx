function TaskCard({ task, onDelete }) {
  const { id, title, assignee, status, dueDate } = task;

  return (
    <div className="task-card">
      <h4 className="task-card-title">{title}</h4>
      <p className="task-card-assignee">{assignee}</p>
      <div className="task-card-footer">
        <span className={`task-card-status status-${status.replace(/\s+/g, "-").toLowerCase()}`}>
          {status}
        </span>
        <span className="task-card-due">{dueDate}</span>
      </div>
      <button
        className="task-card-delete"
        onClick={() => onDelete(id)}
        aria-label={`Delete ${title}`}
      >
        Delete
      </button>
    </div>
  );
}

export default TaskCard;