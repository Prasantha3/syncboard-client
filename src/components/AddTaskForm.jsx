import {useState} from "react";

function AddTaskForm ({onAdd}) {
    const [title, setTitle] = useState("");
    const [assignee, setAssignee] = useState("");
    const [dueDate, setDueDate] = useState("");

    function handleSubmit(e){
        e.preventDefault();
        if(!title.trim() || !assignee.trim() || !dueDate) return;

        onAdd({
            id: Date.now(),
            title: title.trim(),
            assignee: assignee.trim(),
            status: "To Do",
            dueDate,
        });

        setTitle("");
        setAssignee("");
        setDueDate("");
    }

    return(
        <form className="add-task-form" onSubmit={handleSubmit}>
            <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            />
            <input
            type="text"
            placeholder="Assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            />
            <input 
            type="date" 
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            />
            <button type="submit"> Add Task</button>
            </form>
    );
}

export default AddTaskForm;