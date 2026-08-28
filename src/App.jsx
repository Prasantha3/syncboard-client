import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import TaskBoard from "./pages/TaskBoard";
import Navbar from "./components/Navbar";
import "./App.css";
import TaskDetailPage from "./pages/TaskDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<TaskBoard />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="*" element={<NotFoundPage />}/>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;