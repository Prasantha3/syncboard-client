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

  return (
    <>
      <AddTaskForm onAdd={addTask} />
      <div className="board">
        {STATUSES.map((status) => {
          const tasksForStatus = tasks.filter((task) => task.status === status);
          return (
            <Column key={status} title={status}>
              {tasksForStatus.map((task) => (
                <TaskCard key={task.id} task={task} onDelete={deleteTask} />
              ))}
            </Column>
          );
        })}
      </div>
    </>
  );
}

export default Board;