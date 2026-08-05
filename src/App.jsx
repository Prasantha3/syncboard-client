import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { TasksProvider } from './context/TasksContext'
import { FilterProvider } from './context/FilterContext'
import BoardPage from './pages/BoardPage'
import TaskDetailPage from './pages/TaskDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <TasksProvider>
        <div className="app-shell">
          <header className="app-header">
            <h1>SyncBoard</h1>
            <nav>
              <Link to="/">Board</Link>
            </nav>
          </header>
          <main className="app-main">
            <Routes>
              <Route
                path="/"
                element={
                  <FilterProvider>
                    <BoardPage />
                  </FilterProvider>
                }
              />
              <Route path="/tasks/:id" element={<TaskDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </TasksProvider>
    </BrowserRouter>
  )
}
