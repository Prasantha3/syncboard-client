import { useReducer } from "react";
import mockTasks from "../data/mockTasks";
import Column from "./Column";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";

const STATUSES = ["To Do", "In Progress", "Done"];

function taskReducer(state, action) {
  switch (action.type) {
    case "added":
      return [...state, action.task];

    case "deleted":
      return state.filter((task) => task.id !== action.id);

    case "moved":
      return state.map((task) => {
        if (task.id !== action.id) return task;

        const currentIndex = STATUSES.indexOf(task.status);
        const newIndex = currentIndex + action.direction;

        if (newIndex < 0 || newIndex >= STATUSES.length) {
          return task;
        }

        return {
          ...task,
          status: STATUSES[newIndex],
        };
      });

    default:
      return state;
  }
}

function Board() {
  const [tasks, dispatch] = useReducer(taskReducer, mockTasks);

  const addTask = (task) => {
    dispatch({
      type: "added",
      task: task,
    });
  };

  const deleteTask = (id) => {
    dispatch({
      type: "deleted",
      id: id,
    });
  };

  const moveTask = (id, direction) => {
    dispatch({
      type: "moved",
      id: id,
      direction: direction,
    });
  };

  const doneCount = tasks.filter((task) => task.status === "Done").length;
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