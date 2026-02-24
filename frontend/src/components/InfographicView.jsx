function parseInfographic(text) {
  const titleMatch    = text.match(/TITLE:\s*(.+)/i);
  const subtitleMatch = text.match(/SUBTITLE:\s*(.+)/i);
  const takeawayMatch = text.match(/TAKEAWAY:\s*(.+)/i);
  const colLeftMatch  = text.match(/COLUMN_LEFT:\s*(.+)/i);
  const colRightMatch = text.match(/COLUMN_RIGHT:\s*(.+)/i);

  const leftPoints  = [];
  const rightPoints = [];
  let mode = null;
  for (const line of text.split("\n")) {
    if (/^COLUMN_LEFT:/i.test(line))                 { mode = "left";  continue; }
    if (/^COLUMN_RIGHT:/i.test(line))                { mode = "right"; continue; }
    if (/^(STAT|SECTION|TAKEAWAY):/i.test(line))     { mode = null; }
    const pt = line.match(/^POINT:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)/i);
    if (pt) {
      const item = { icon: pt[1].trim(), title: pt[2].trim(), desc: pt[3].trim() };
      if (mode === "left")  leftPoints.push(item);
      else if (mode === "right") rightPoints.push(item);
    }
  }

  const stats = [...text.matchAll(/^STAT:\s*(.+?)\s*\|\s*(.+)/gim)].map(m => ({
    label: m[1].trim(), value: m[2].trim(),
  }));

  const sections = [];
  const sectionBlocks = text.split(/^SECTION:\s*/im).slice(1);
  for (const block of sectionBlocks) {
    const lines = block.split("\n").filter(l => l.trim());
    const title = lines[0]?.trim() || "";
    const bullets = lines.slice(1)
      .filter(l => /^[•\-\*]/.test(l.trim()))
      .map(l => l.replace(/^[•\-\*]\s*/, "").trim());
    if (title) sections.push({ title, bullets });
  }

  return {
    title:      titleMatch?.[1]?.trim()    || "",
    subtitle:   subtitleMatch?.[1]?.trim() || "",
    colLeft:    colLeftMatch?.[1]?.trim()  || "The Challenge",
    colRight:   colRightMatch?.[1]?.trim() || "The Solution",
    leftPoints, rightPoints,
    stats, sections,
    takeaway: takeawayMatch?.[1]?.trim() || "",
  };
}

const STAT_PALETTE = [
  { bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.38)",  val: "#60a5fa" },
  { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.32)",   val: "#4ade80" },
  { bg: "rgba(251,146,60,0.13)",  border: "rgba(251,146,60,0.35)",  val: "#fb923c" },
  { bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.32)",  val: "#c084fc" },
  { bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.30)",  val: "#f472b6" },
];

const SECTION_PALETTE = [
  { top: "#3b82f6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.22)" },
  { top: "#22c55e", bg: "rgba(34,197,94,0.07)",   border: "rgba(34,197,94,0.20)"  },
  { top: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.22)" },
  { top: "#a855f7", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.22)" },
];

export default function InfographicView({ content }) {
  const d = parseInfographic(content);
  const hasVersus = d.leftPoints.length > 0 || d.rightPoints.length > 0;

  if (!d.title && d.sections.length === 0 && !hasVersus) {
    return <div className="toolContent" style={{ padding: 16, whiteSpace: "pre-wrap" }}>{content}</div>;
  }

  return (
    <div className="igWrap">

      {/* ── Banner ── */}
      <div className="igBanner">
        <div className="igTitle">{d.title}</div>
        {d.subtitle && <div className="igSubtitle">{d.subtitle}</div>}
      </div>

      {/* ── Two-column challenge / solution ── */}
      {hasVersus && (
        <div className="igVersus">
          <div className="igCol igColLeft">
            <div className="igColHeader igColHeaderLeft">{d.colLeft}</div>
            {d.leftPoints.map((pt, i) => (
              <div key={i} className="igPoint">
                <div className="igPointIcon">{pt.icon}</div>
                <div className="igPointBody">
                  <div className="igPointTitle">{pt.title}</div>
                  <div className="igPointDesc">{pt.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="igVersusDiv" />

          <div className="igCol igColRight">
            <div className="igColHeader igColHeaderRight">{d.colRight}</div>
            {d.rightPoints.map((pt, i) => (
              <div key={i} className="igPoint">
                <div className="igPointIcon">{pt.icon}</div>
                <div className="igPointBody">
                  <div className="igPointTitle">{pt.title}</div>
                  <div className="igPointDesc">{pt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats row ── */}
      {d.stats.length > 0 && (
        <div className="igStats">
          {d.stats.map((s, i) => {
            const c = STAT_PALETTE[i % STAT_PALETTE.length];
            return (
              <div key={i} className="igStat" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                <div className="igStatValue" style={{ color: c.val }}>{s.value}</div>
                <div className="igStatLabel">{s.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Sections grid ── */}
      {d.sections.length > 0 && (
        <div className="igSections">
          {d.sections.map((sec, i) => {
            const c = SECTION_PALETTE[i % SECTION_PALETTE.length];
            return (
              <div
                key={i}
                className="igSection"
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderTopColor: c.top,
                  borderTopWidth: 3,
                }}
              >
                <div className="igSectionTitle" style={{ color: c.top }}>{sec.title}</div>
                <ul className="igBullets">
                  {sec.bullets.map((b, j) => (
                    <li key={j} className="igBullet">
                      <span className="igDot" style={{ background: c.top }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Takeaway ── */}
      {d.takeaway && (
        <div className="igTakeaway">
          <span className="igTakeawayIcon">💡</span>
          <span>{d.takeaway}</span>
        </div>
      )}

    </div>
  );
}
