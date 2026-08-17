import Button from "./Button";

const STATUSES = ["To Do", "In Progress", "Done"];

function TaskCard({ task, onDelete, onMove }) {
  const { id, title, assignee, status, dueDate } = task;

  const currentIndex = STATUSES.indexOf(status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < STATUSES.length - 1;

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
      <div className="task-card-actions">
        <Button
          variant="secondary"
          className="task-card-move"
          onClick={() => onMove(id, -1)}
          disabled={!canMoveLeft}
          aria-label={`Move ${title} left`}
        >
          ← Move left
        </Button>
        <Button
          variant="secondary"
          className="task-card-move"
          onClick={() => onMove(id, 1)}
          disabled={!canMoveRight}
          aria-label={`Move ${title} right`}
        >
          Move right →
        </Button>
        <Button
          variant="danger"
          className="task-card-delete"
          onClick={() => onDelete(id)}
          aria-label={`Delete ${title}`}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default TaskCard;