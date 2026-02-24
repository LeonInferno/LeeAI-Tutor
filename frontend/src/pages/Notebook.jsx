import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import TopNav from "../components/TopNav";
import AddSourceModal from "../components/AddSourceModal";
import ToolOutputModal from "../components/ToolOutputModal";
import QuizSettingsModal from "../components/QuizSettingsModal";

const TOOLS = [
  "Audio Summary",
  "Video Summary",
  "Concept Map",
  "Study Guide",
  "Flashcards",
  "Quiz",
  "Infographic",
  "Slide Deck",
  "Key Facts",
];

const TOOL_ICONS = {
  "Audio Summary":  "🎙️",
  "Video Summary":  "🎬",
  "Concept Map":    "🗺️",
  "Study Guide":    "📖",
  "Flashcards":     "🃏",
  "Quiz":           "📝",
  "Infographic":    "📊",
  "Slide Deck":     "📑",
  "Key Facts":      "💡",
};

export default function Notebook() {
  const { id } = useParams();
  const nav = useNavigate();

  const [sources, setSources] = useState([]);
  const [notes, setNotes] = useState("");
  const [showAddSource, setShowAddSource] = useState(false);

  // Tool generation state
  const [activeTool, setActiveTool] = useState(null);
  const [toolContent, setToolContent] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [questionType, setQuestionType] = useState("multiple-choice");
  const [toolLoading, setToolLoading] = useState(false);
  const [toolError, setToolError] = useState("");
  const [generatingTool, setGeneratingTool] = useState(null);

  // Quiz settings modal
  const [showQuizSettings, setShowQuizSettings] = useState(false);

  const title = useMemo(() => "Untitled notebook", [id]);

  function handleAddSource(source) {
    setSources((prev) => [source, ...prev]);
    setShowAddSource(false);
  }

  function removeSource(sourceId) {
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
  }

  function buildContext() {
    if (sources.length === 0) return "";
    return sources
      .map((s, i) => `[Source ${i + 1}: ${s.name}]\n${s.content}`)
      .join("\n\n---\n\n");
  }

  function onToolClick(toolType) {
    if (toolType === "Quiz") {
      setShowQuizSettings(true);
    } else {
      runTool(toolType, {});
    }
  }

  function onQuizConfirm(settings) {
    setShowQuizSettings(false);
    runTool("Quiz", settings);
  }

  async function runTool(toolType, extra) {
    setActiveTool(toolType);
    setToolContent("");
    setAudioUrl(null);
    setToolError("");
    setToolLoading(true);
    setGeneratingTool(toolType);
    if (extra.questionType) setQuestionType(extra.questionType);

    try {
      if (toolType === "Audio Summary") {
        const res = await fetch("http://localhost:8080/api/leeai/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolType, context: buildContext() }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `Request failed: ${res.status}`);
        }
        const blob = await res.blob();
        setAudioUrl(URL.createObjectURL(blob));
      } else if (toolType === "Video Summary") {
        const res = await fetch("http://localhost:8080/api/leeai/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context: buildContext() }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `Request failed: ${res.status}`);
        }
        setToolContent(await res.text());
      } else {
        const res = await fetch("http://localhost:8080/api/leeai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolType,
            context: buildContext(),
            count: extra.count,
            questionType: extra.questionType,
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `Request failed: ${res.status}`);
        }
        setToolContent(await res.text());
      }
    } catch (err) {
      setToolError(err.message || "Could not reach the server.");
    } finally {
      setToolLoading(false);
      setGeneratingTool(null);
    }
  }

  function closeToolModal() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setActiveTool(null);
    setToolContent("");
    setAudioUrl(null);
    setToolError("");
    setToolLoading(false);
  }

  return (
    <div className="shell">
      <TopNav />

      <div className="workspaceTop">
        <button className="btnGhost" onClick={() => nav("/app")}>← Back</button>
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
            <button className="btnSmall" onClick={() => setShowAddSource(true)}>+ Add</button>
          </div>

          <div className="sources">
            {sources.length === 0 ? (
              <div className="empty">
                <div className="emptyTitle">No sources yet</div>
                <div className="emptySub">Add text, links, or files to give LeeAI context.</div>
                <button className="emptyAddBtn" onClick={() => setShowAddSource(true)} type="button">
                  + Add your first source
                </button>
              </div>
            ) : (
              sources.map((s) => (
                <div key={s.id} className="sourceRow">
                  <div className="sourceIcon">{s.icon || "📄"}</div>
                  <div className="sourceMeta">
                    <div className="sourceName">{s.name}</div>
                    <div className="sourceType">{s.type}</div>
                  </div>
                  <button className="sourceRemove" onClick={() => removeSource(s.id)} title="Remove" type="button">✕</button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* MIDDLE: Chat */}
        <main className="panel chatPanel">
          <div className="panelHead">
            <div className="panelTitle">Chat</div>
            <div className="panelHint">{sources.length} source{sources.length !== 1 ? "s" : ""}</div>
          </div>
          <ChatPanel notebookId={id} />
        </main>

        {/* RIGHT: Tools + Notes */}
        <aside className="panel">
          <div className="panelHead">
            <div className="panelTitle">Tools</div>
          </div>

          <div className="studioGrid">
            {TOOLS.map((tool) => (
              <button
                key={tool}
                className={`studioBtn ${generatingTool === tool ? "studioBtnLoading" : ""}`}
                type="button"
                onClick={() => onToolClick(tool)}
                disabled={generatingTool !== null}
              >
                <span className="studioBtnIcon">{TOOL_ICONS[tool]}</span>
                <span className="studioBtnLabel">{tool}</span>
                {generatingTool === tool && <span className="studioBtnSpinner" />}
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

      {showAddSource && (
        <AddSourceModal onAdd={handleAddSource} onClose={() => setShowAddSource(false)} />
      )}

      {showQuizSettings && (
        <QuizSettingsModal
          onConfirm={onQuizConfirm}
          onClose={() => setShowQuizSettings(false)}
        />
      )}

      {activeTool && (
        <ToolOutputModal
          toolType={activeTool}
          content={toolContent}
          audioUrl={audioUrl}
          questionType={questionType}
          isLoading={toolLoading}
          error={toolError}
          onClose={closeToolModal}
        />
      )}
    </div>
  );
}
