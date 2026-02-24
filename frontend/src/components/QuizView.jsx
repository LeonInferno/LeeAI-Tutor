import { useState } from "react";

function parseMC(text) {
  const questions = [];
  const blocks = text.split(/\n(?=Q:)/i).filter(b => b.trim());
  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    const qLine = lines.find(l => /^Q:/i.test(l));
    if (!qLine) continue;
    const question = qLine.replace(/^Q:\s*/i, "");
    const options = {};
    let correct = "";
    for (const line of lines) {
      const opt = line.match(/^([A-D])\)\s*(.+)/i);
      if (opt) options[opt[1].toUpperCase()] = opt[2].trim();
      const corr = line.match(/^CORRECT:\s*([A-D])/i);
      if (corr) correct = corr[1].toUpperCase();
    }
    if (question && Object.keys(options).length >= 2) {
      questions.push({ question, options, correct });
    }
  }
  return questions;
}

function parseSA(text) {
  const questions = [];
  const blocks = text.split(/\n(?=Q:)/i).filter(b => b.trim());
  for (const block of blocks) {
    const qMatch = block.match(/Q:\s*([\s\S]+?)(?=\nANSWER:)/i);
    const aMatch = block.match(/ANSWER:\s*([\s\S]+?)(?=\nQ:|$)/i);
    if (qMatch && aMatch) questions.push({ question: qMatch[1].trim(), answer: aMatch[1].trim() });
  }
  return questions;
}

function MCQuestion({ q, qIndex, onAnswer, locked }) {
  const [selected, setSelected] = useState(null);

  function pick(letter) {
    if (locked || selected) return;
    setSelected(letter);
    onAnswer(letter === q.correct);
  }

  return (
    <div className="quizQ">
      <div className="quizQNum">Question {qIndex + 1}</div>
      <div className="quizQText">{q.question}</div>
      <div className="quizOptions">
        {Object.entries(q.options).map(([letter, text]) => {
          let cls = "quizOpt";
          if (selected) {
            if (letter === q.correct) cls += " quizOptCorrect";
            else if (letter === selected) cls += " quizOptWrong";
          }
          return (
            <button key={letter} className={cls} onClick={() => pick(letter)} disabled={!!selected}>
              <span className="quizOptLetter">{letter}</span>
              <span>{text}</span>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className={`quizFeedback ${selected === q.correct ? "quizFbCorrect" : "quizFbWrong"}`}>
          {selected === q.correct ? "✓ Correct!" : `✗ Incorrect — answer: ${q.correct}) ${q.options[q.correct]}`}
        </div>
      )}
    </div>
  );
}

function SAQuestion({ q, qIndex, onAnswer, answered }) {
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);

  function reveal() {
    setRevealed(true);
    onAnswer();
  }

  return (
    <div className="quizQ">
      <div className="quizQNum">Question {qIndex + 1}</div>
      <div className="quizQText">{q.question}</div>
      <textarea
        className="quizSAInput"
        placeholder="Type your answer here…"
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={revealed}
        rows={3}
      />
      {!revealed && (
        <button className="btnPrimary" onClick={reveal} style={{ marginTop: 10 }} type="button">
          Reveal Answer
        </button>
      )}
      {revealed && (
        <div className="quizSAAnswer">
          <div className="quizSALabel">Model Answer</div>
          <div>{q.answer}</div>
        </div>
      )}
    </div>
  );
}

export default function QuizView({ content, questionType }) {
  const isMC = questionType !== "short-answer";
  const questions = isMC ? parseMC(content) : parseSA(content);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});
  const [done, setDone] = useState(false);

  if (questions.length === 0) {
    return <div className="toolContent" style={{ padding: 16, whiteSpace: "pre-wrap" }}>{content}</div>;
  }

  const q = questions[current];
  const isAnswered = answered[current] !== undefined;

  function handleAnswer(correct) {
    if (answered[current] !== undefined) return;
    setAnswered(prev => ({ ...prev, [current]: correct }));
    if (isMC && correct) setScore(s => s + 1);
  }

  function handleSAAnswer() {
    if (answered[current] !== undefined) return;
    setAnswered(prev => ({ ...prev, [current]: true }));
  }

  function next() {
    if (current < questions.length - 1) setCurrent(c => c + 1);
    else setDone(true);
  }

  function restart() {
    setCurrent(0);
    setScore(0);
    setAnswered({});
    setDone(false);
  }

  if (done && isMC) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="quizResults">
        <div className="quizResultsIcon">{pct >= 70 ? "🎉" : "📚"}</div>
        <div className="quizResultsTitle">Quiz Complete!</div>
        <div className="quizResultsScore">{score} / {questions.length} correct</div>
        <div className="quizResultsPct" style={{ color: pct >= 70 ? "var(--green)" : "#ff8080" }}>
          {pct}%
        </div>
        <div className="quizResultsMsg">
          {pct >= 90 ? "Excellent work!" : pct >= 70 ? "Good job, keep it up!" : "Keep studying — you'll get there!"}
        </div>
        <button className="btnPrimary" onClick={restart} type="button">Try Again</button>
      </div>
    );
  }

  return (
    <div className="quizWrap">
      <div className="quizTopBar">
        <span className="quizTopCount">{current + 1} / {questions.length}</span>
        {isMC && <span className="quizTopScore">Score: {score}</span>}
        <div className="quizProgressBar">
          <div className="quizProgressFill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      {isMC
        ? <MCQuestion key={current} q={q} qIndex={current} onAnswer={handleAnswer} locked={isAnswered} />
        : <SAQuestion key={current} q={q} qIndex={current} onAnswer={handleSAAnswer} answered={isAnswered} />
      }

      <div className="quizNavRow">
        <button className="fcNavBtn" onClick={() => setCurrent(c => c - 1)} disabled={current === 0} type="button">
          ← Prev
        </button>
        {isAnswered && (
          <button className="btnPrimary" onClick={next} type="button">
            {current === questions.length - 1 ? (isMC ? "See Results" : "Finish") : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}
