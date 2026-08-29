import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTaskById } from "../api/tasks";

export default function TaskDetailPage() {
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTaskById(id);

        setTask(data);
      } catch (err) {
        setError(err.message || "Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  return (
    <div className="task-detail">
      <Link to="/">&larr; Back to board</Link>

      {/* Loading State */}
      {loading && (
        <div className="board-message">
          <p>Loading task details...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="board-error">
          <p>⚠️ Error: {error}</p>
        </div>
      )}

      {/* Success State */}
      {!loading && !error && task && (
        <div>
          <h1>{task.title}</h1>

          <p>
            <strong>Assignee:</strong>{" "}
            {task.assignee || "Unassigned"}
          </p>

          <p>
            <strong>Status:</strong> {task.status}
          </p>

          <p>
            <strong>Due Date:</strong>{" "}
            {task.dueDate || "No due date"}
          </p>
        </div>
      )}

      {/* Not Found State */}
      {!loading && !error && !task && (
        <div className="board-message">
          <p>Task not found.</p>
        </div>
      )}
    </div>
  );
}