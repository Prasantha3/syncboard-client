import { Link } from "react-router-dom";

export default function NotFoundPage(){
    return (
        <div>
            <h1>404 - Page not found</h1>
            <p>That page doesn't exist.</p>
            <Link to="/">&larr; Back to board</Link>
        </div>
    );
}