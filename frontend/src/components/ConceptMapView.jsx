import { useMemo } from "react";

// Layout constants (px)
const C = {
  ROOT_W:   112, ROOT_H:   44,
  BRANCH_W: 132, BRANCH_H: 36,
  LEAF_W:   178, LEAF_H:   54,   // taller to fit concept + definition
  H_GAP:     46,
  V_GAP_LEAF: 10,
  V_GAP_BRANCH: 24,
  PAD_X: 12,
  PAD_Y: 22,
};

function parseToTree(text) {
  const lines = text.split("\n").filter(l => l.trim());
  let root = null;
  const branches = [];
  let cur = null;

  for (const line of lines) {
    const rM = line.match(/^ROOT:\s*(.+)/i);
    const bM = line.match(/^\s{1,4}BRANCH:\s*(.+)/i);
    const nM = line.match(/^\s{2,8}NODE:\s*(.+)/i);

    if (rM)       { root = rM[1].trim(); }
    else if (bM)  { cur = { name: bM[1].trim(), nodes: [] }; branches.push(cur); }
    else if (nM && cur) {
      const raw  = nM[1].trim();
      const pipe = raw.indexOf(" | ");
      if (pipe !== -1) {
        cur.nodes.push({ name: raw.slice(0, pipe).trim(), def: raw.slice(pipe + 3).trim() });
      } else {
        cur.nodes.push({ name: raw, def: "" });
      }
    }
  }

  return { root: root || "Concept Map", branches };
}

function computeLayout(tree) {
  const col0x = C.PAD_X;
  const col1x = C.PAD_X + C.ROOT_W + C.H_GAP;
  const col2x = C.PAD_X + C.ROOT_W + C.H_GAP + C.BRANCH_W + C.H_GAP;

  let y = C.PAD_Y;
  const branchLayouts = [];

  for (const branch of tree.branches) {
    const lc    = branch.nodes.length;
    const groupH = lc > 0
      ? lc * C.LEAF_H + (lc - 1) * C.V_GAP_LEAF
      : C.BRANCH_H;
    const by = y + Math.max(0, (groupH - C.BRANCH_H) / 2);

    branchLayouts.push({
      name: branch.name,
      x: col1x,  y: by,  cy: by + C.BRANCH_H / 2,
      rightX: col1x + C.BRANCH_W,
      leafLayouts: branch.nodes.map((node, idx) => ({
        name: node.name,
        def:  node.def,
        x: col2x,
        y: y + idx * (C.LEAF_H + C.V_GAP_LEAF),
        cy: y + idx * (C.LEAF_H + C.V_GAP_LEAF) + C.LEAF_H / 2,
      })),
    });

    y += groupH + C.V_GAP_BRANCH;
  }

  const totalH  = Math.max(y - C.V_GAP_BRANCH + C.PAD_Y, C.ROOT_H + 2 * C.PAD_Y, 120);
  const totalW  = col2x + C.LEAF_W + C.PAD_X;
  const rootCY  = totalH / 2;

  return {
    totalW, totalH,
    rootX: col0x,
    rootY: rootCY - C.ROOT_H / 2,
    rootCY,
    rootRightX: col0x + C.ROOT_W,
    branchLayouts,
  };
}

function curve(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
}

export default function ConceptMapView({ content }) {
  const tree   = useMemo(() => parseToTree(content), [content]);
  const layout = useMemo(() => computeLayout(tree),  [tree]);

  if (!tree.branches.length) {
    return (
      <div className="toolContent" style={{ padding: 16, whiteSpace: "pre-wrap" }}>
        {content}
      </div>
    );
  }

  const { totalW, totalH, rootX, rootY, rootCY, rootRightX, branchLayouts } = layout;

  return (
    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
      <div style={{ position: "relative", width: totalW, height: totalH, minWidth: 380 }}>

        {/* ── SVG connection lines ── */}
        <svg
          style={{
            position: "absolute", top: 0, left: 0,
            width: totalW, height: totalH,
            overflow: "visible", pointerEvents: "none",
          }}
          viewBox={`0 0 ${totalW} ${totalH}`}
        >
          {branchLayouts.map((bl, bi) => (
            <g key={bi}>
              {/* root → branch */}
              <path
                d={curve(rootRightX, rootCY, bl.x, bl.cy)}
                fill="none"
                stroke="rgba(99,155,255,0.42)"
                strokeWidth="1.5"
              />
              {/* branch → each leaf */}
              {bl.leafLayouts.map((ll, li) => (
                <path
                  key={li}
                  d={curve(bl.rightX, bl.cy, ll.x, ll.cy)}
                  fill="none"
                  stroke="rgba(74,222,128,0.38)"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          ))}
        </svg>

        {/* ── Root node ── */}
        <div
          className="cmTreeRoot"
          style={{ position: "absolute", left: rootX, top: rootY, width: C.ROOT_W, height: C.ROOT_H }}
        >
          {tree.root}
        </div>

        {/* ── Branches + Leaves ── */}
        {branchLayouts.map((bl, bi) => (
          <div key={bi}>
            <div
              className="cmTreeBranch"
              style={{ position: "absolute", left: bl.x, top: bl.y, width: C.BRANCH_W, height: C.BRANCH_H }}
            >
              {bl.name}
            </div>
            {bl.leafLayouts.map((ll, li) => (
              <div
                key={li}
                className="cmTreeLeaf"
                style={{ position: "absolute", left: ll.x, top: ll.y, width: C.LEAF_W, height: C.LEAF_H }}
              >
                <div className="cmLeafName">{ll.name}</div>
                {ll.def && <div className="cmLeafDef">{ll.def}</div>}
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  );
}
