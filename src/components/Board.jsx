import { useEffect, useReducer, useState } from "react";
import { getTasks } from "../api/tasks";
import Column from "./Column";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";

const STATUSES = ["To Do", "In Progress", "Done"];

function tasksReducer(tasks, action) {
  switch (action.type) {
    case "loaded": {
      return action.tasks;
    }

    case "added": {
      return [...tasks, action.task];
    }

    case "moved": {
      return tasks.map((t) => {
        if (t.id !== action.id) return t;

        const currentIndex = STATUSES.indexOf(t.status);
        const newIndex = currentIndex + action.direction;

        if (newIndex < 0 || newIndex >= STATUSES.length) return t;

        return {
          ...t,
          status: STATUSES[newIndex],
        };
      });
    }

    case "deleted": {
      return tasks.filter((t) => t.id !== action.id);
    }

    default: {
      throw new Error(`Unknown action type: ${action.type}`);
    }
  }
}

function Board() {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTasks();

        dispatch({
          type: "loaded",
          tasks: data,
        });
      } catch (err) {
        setError(err.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const addTask = (task) => {
    dispatch({
      type: "added",
      task,
    });
  };

  const deleteTask = (id) => {
    dispatch({
      type: "deleted",
      id,
    });
  };

  const moveTask = (id, direction) => {
    dispatch({
      type: "moved",
      id,
      direction,
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="board-message">
        <p>Loading tasks...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="board-error">
        <p>⚠️ Error: {error}</p>
      </div>
    );
  }

  // Empty State
  if (tasks.length === 0) {
    return (
      <div className="board-message">
        <p>No tasks available.</p>
      </div>
    );
  }

  // Success State
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const totalCount = tasks.length;

  return (
    <>
      <AddTaskForm onAdd={addTask} />

      <p className="board-counter">
        {doneCount} of {totalCount} done
      </p>

      <div className="board">
        {STATUSES.map((status) => {
          const tasksForStatus = tasks.filter(
            (task) => task.status === status
          );

          return (
            <Column key={status} title={status}>
              {tasksForStatus.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                  onMove={moveTask}
                />
              ))}
            </Column>
          );
        })}
      </div>
    </>
  );
}

export default Board;