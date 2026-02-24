import { useState, useEffect } from "react";

function parseFlashcards(text) {
  const cards = [];
  // Primary: CARD: N\nQ: ...\nA: ... format
  const blocks = text.split(/CARD:\s*\d+/i).filter(b => b.trim());
  if (blocks.length > 1) {
    for (const block of blocks) {
      const qMatch = block.match(/Q:\s*([\s\S]+?)(?=\nA:)/i);
      const aMatch = block.match(/A:\s*([\s\S]+?)(?=\nCARD:|$)/i);
      if (qMatch && aMatch) cards.push({ q: qMatch[1].trim(), a: aMatch[1].trim() });
    }
  }
  // Fallback: **Q:** / **A:** markdown format
  if (cards.length === 0) {
    const pairs = [...text.matchAll(/\*\*Q:\*\*\s*([\s\S]+?)\*\*A:\*\*\s*([\s\S]+?)(?=\*\*Q:\*\*|$)/gi)];
    for (const p of pairs) cards.push({ q: p[1].trim(), a: p[2].trim() });
  }
  return cards;
}

export default function FlashcardsView({ content }) {
  const cards = parseFlashcards(content);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [shuffled, setShuffled] = useState(false);

  if (cards.length === 0) {
    return <div className="toolContent" style={{ padding: 16, whiteSpace: "pre-wrap" }}>{content}</div>;
  }

  const card = cards[order[index]];

  function flip() { setFlipped(f => !f); }

  function go(dir) {
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.max(0, Math.min(cards.length - 1, i + dir))), 120);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped(f => !f);
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        setFlipped(false);
        setTimeout(() => setIndex(i => Math.min(cards.length - 1, i + 1)), 120);
      }
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        setFlipped(false);
        setTimeout(() => setIndex(i => Math.max(0, i - 1)), 120);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cards.length]);

  function toggleShuffle() {
    if (shuffled) {
      setOrder(cards.map((_, i) => i));
      setShuffled(false);
    } else {
      setOrder([...cards.map((_, i) => i)].sort(() => Math.random() - 0.5));
      setShuffled(true);
    }
    setIndex(0);
    setFlipped(false);
  }

  return (
    <div className="fcWrap">
      <div className="fcTopBar">
        <span className="fcCount">{index + 1} / {cards.length}</span>
        <div className="fcProgressBar">
          <div className="fcProgressFill" style={{ width: `${((index + 1) / cards.length) * 100}%` }} />
        </div>
        <button className="fcControlBtn" onClick={toggleShuffle}>
          {shuffled ? "↺ Reset" : "⇌ Shuffle"}
        </button>
      </div>

      <div className={`fcCard ${flipped ? "fcFlipped" : ""}`} onClick={flip}>
        <div className="fcInner">
          <div className="fcFront">
            <div className="fcSideLabel">Question</div>
            <div className="fcText">{card.q}</div>
            <div className="fcTap">Tap or Space to flip</div>
          </div>
          <div className="fcBack">
            <div className="fcSideLabel">Answer</div>
            <div className="fcText">{card.a}</div>
          </div>
        </div>
      </div>

      <div className="fcNavRow">
        <button className="fcNavBtn" onClick={() => go(-1)} disabled={index === 0}>← Prev</button>
        <button className="fcNavBtn" onClick={() => go(1)} disabled={index === cards.length - 1}>Next →</button>
      </div>
    </div>
  );
}
