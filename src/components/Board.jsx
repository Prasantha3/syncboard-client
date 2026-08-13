import { useState } from "react";
import mockTasks from "../data/mockTasks";
import Column from "./Column";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";

const STATUSES = ["To Do", "In Progress", "Done"];

function Board() {
  const [tasks, setTasks] = useState(mockTasks);

  const addTask = (task) => setTasks((prev) => [...prev, task]);

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const moveTask = (id, direction) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const currentIndex = STATUSES.indexOf(t.status);
        const newIndex = currentIndex + direction;
        if (newIndex < 0 || newIndex >= STATUSES.length) return t;
        return { ...t, status: STATUSES[newIndex] };
      })
    );
  };

  return (
    <>
      <AddTaskForm onAdd={addTask} />
      <div className="board">
        {STATUSES.map((status) => {
          const tasksForStatus = tasks.filter((task) => task.status === status);
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