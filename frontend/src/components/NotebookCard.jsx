function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleDateString([], { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "";
  }
}

export default function NotebookCard({ notebook, onOpen, onDelete }) {
  return (
    <div className="nbCard" onClick={onOpen} role="button" tabIndex={0}>
      <div className="nbIcon">📓</div>
      <div className="nbTitle">{notebook.title}</div>
      <div className="nbMeta">
        {fmtDate(notebook.createdAt)} • {notebook.sourcesCount ?? 0} sources
      </div>

      <button
        className="nbMenu"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete notebook"
        type="button"
      >
        ⋯
      </button>
    </div>
  );
}