import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import TopNav from "../components/TopNav";

export default function Notebook() {
  const { id } = useParams();
  const nav = useNavigate();

  // UI-only state for now
  const [sources, setSources] = useState([]);
  const [notes, setNotes] = useState("");

  const title = useMemo(() => "Untitled notebook", [id]);

  function addSourceMock() {
    const next = {
      id: crypto.randomUUID(),
      name: `Source ${sources.length + 1}`,
      type: "text",
    };
    setSources((p) => [next, ...p]);
  }

  return (
    <div className="shell">
      <TopNav />

      <div className="workspaceTop">
        <button className="btnGhost" onClick={() => nav("/")}>← Back</button>
        <div className="wsTitle">{title}</div>
        <div className="wsRight">
          <button className="btnGhost">Share</button>
          <button className="btnPrimary">Create notebook</button>
        </div>
      </div>

      <div className="workspace">
        {/* LEFT: Sources */}
        <aside className="panel">
          <div className="panelHead">
            <div className="panelTitle">Sources</div>
            <button className="btnSmall" onClick={addSourceMock}>+ Add</button>
          </div>

          <div className="sources">
            {sources.length === 0 ? (
              <div className="empty">
                <div className="emptyTitle">No sources yet</div>
                <div className="emptySub">Add PDFs, links, or text later.</div>
              </div>
            ) : (
              sources.map((s) => (
                <div key={s.id} className="sourceRow">
                  <div className="sourceIcon">📄</div>
                  <div className="sourceMeta">
                    <div className="sourceName">{s.name}</div>
                    <div className="sourceType">{s.type}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* MIDDLE: Chat */}
        <main className="panel chatPanel">
          <div className="panelHead">
            <div className="panelTitle">Chat</div>
            <div className="panelHint">{sources.length} sources</div>
          </div>

          <ChatPanel notebookId={id} />
        </main>

        {/* RIGHT: Studio + Notes */}
        <aside className="panel">
          <div className="panelHead">
            <div className="panelTitle">Tools</div>
          </div>

          <div className="studioGrid">
            {[
              "Audio Summary",
              "Video Summary",
              "Concept Map",
              "Study Guide",
              "Flashcards",
              "Quiz",
              "Infographic",
              "Slide Deck",
              "Key Facts",
            ].map((x) => (
              <button key={x} className="studioBtn" type="button">
                {x}
              </button>
            ))}
          </div>

          <div className="notesBlock">
            <div className="panelTitle">Notes</div>
            <textarea
              className="notes"
              placeholder="Add notes for this notebook..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}