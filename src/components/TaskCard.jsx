function TaskCard({ task }) {
  const { title, assignee, status, dueDate } = task;

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
    </div>
  );
}

export default TaskCard;