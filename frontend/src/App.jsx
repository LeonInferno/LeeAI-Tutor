import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Notebooks from "./pages/Notebooks";
import Notebook from "./pages/Notebook";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Notebooks />} />
        <Route path="/notebook/:id" element={<Notebook />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}