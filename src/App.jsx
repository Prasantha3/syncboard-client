import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import TaskBoard from "./pages/TaskBoard";
import Navbar from "./components/Navbar";
import "./App.css";
import { localDB } from './db/pouch';
import TaskDetailPage from "./pages/TaskDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

function MainLayout() {
  const { theme } = useTheme();

  return (
    <div className={`app ${theme}-theme`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<TaskBoard />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

function App() {
  useEffect(() => {
    localDB.info().then((info) => {
      console.log("PouchDB initialized:", info);
    }).catch((err) => {
      console.error("PouchDB initialization error:", err);
    });
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;