import {useParams, Link } from "react-router-dom";

export default function TaskSetailPage(){
    const { id } = useParams();

    return (
        <div>
            <Link to="/">&larr; Back to board</Link>
            <h1>Task {id}</h1>
            <p>Details for task {id} go here.</p>
        </div>

    );
}