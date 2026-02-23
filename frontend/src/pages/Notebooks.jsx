import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import NotebookCard from "../components/NotebookCard";

const STORAGE_KEY = "leeai_notebooks_v1";

function loadNotebooks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveNotebooks(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function Notebooks() {
  const nav = useNavigate();
  const [notebooks, setNotebooks] = useState(() => loadNotebooks());

  useEffect(() => saveNotebooks(notebooks), [notebooks]);

  function createNotebook() {
    const id = crypto.randomUUID();
    const n = {
      id,
      title: "Untitled notebook",
      createdAt: Date.now(),
      sourcesCount: 0,
    };
    setNotebooks((prev) => [n, ...prev]);
    nav(`/notebook/${id}`);
  }

  function openNotebook(id) {
    nav(`/notebook/${id}`);
  }

  function deleteNotebook(id) {
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
  }

  const sorted = useMemo(() => {
    return [...notebooks].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [notebooks]);

  return (
    <div className="shell">
      <TopNav />

      <div className="pageHead">
        <h1 className="h1">My notebooks</h1>
        <button className="btnPrimary" onClick={createNotebook}>
          + Create new
        </button>
      </div>

      <div className="grid">
        <button className="createCard" onClick={createNotebook}>
          <div className="plus">+</div>
          <div className="createText">Create new notebook</div>
        </button>

        {sorted.map((n) => (
          <NotebookCard
            key={n.id}
            notebook={n}
            onOpen={() => openNotebook(n.id)}
            onDelete={() => deleteNotebook(n.id)}
          />
        ))}
      </div>
    </div>
  );
}