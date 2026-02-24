import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import FlashcardsView from "./FlashcardsView";
import QuizView from "./QuizView";
import SlideDeckView from "./SlideDeckView";
import InfographicView from "./InfographicView";
import KeyFactsView from "./KeyFactsView";
import ConceptMapView from "./ConceptMapView";
import VideoSummaryView from "./VideoSummaryView";

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

function MarkdownView({ content }) {
  return (
    <div className="toolContent">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function renderContent(toolType, content, questionType) {
  switch (toolType) {
    case "Flashcards":     return <FlashcardsView content={content} />;
    case "Quiz":           return <QuizView content={content} questionType={questionType} />;
    case "Slide Deck":     return <SlideDeckView content={content} />;
    case "Infographic":    return <InfographicView content={content} />;
    case "Key Facts":      return <KeyFactsView content={content} />;
    case "Concept Map":    return <ConceptMapView content={content} />;
    case "Video Summary":  return <VideoSummaryView content={content} />;
    default:               return <MarkdownView content={content} />;
  }
}

export default function ToolOutputModal({
  toolType, content, audioUrl, questionType,
  isLoading, error, onClose
}) {
  const [copied, setCopied] = useState(false);
  const icon = TOOL_ICONS[toolType] || "✨";
  const isAudio = toolType === "Audio Summary";
  const isVideo = toolType === "Video Summary";
  const hasContent = isAudio ? !!audioUrl : !!content;
  const isInteractive = ["Flashcards", "Quiz", "Slide Deck", "Video Summary"].includes(toolType);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* ignore */ }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget && !isLoading) onClose();
  }

  return (
    <div className="modalBackdrop" onClick={handleBackdrop}>
      <div className="modal toolModal" onClick={e => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">
            <span className="toolModalIcon">{icon}</span>
            {toolType}
          </div>
          {!isLoading && (
            <button className="modalClose" onClick={onClose} type="button">✕</button>
          )}
        </div>

        <div className="toolModalBody">
          {isLoading && (
            <div className="toolLoading">
              <div className="toolSpinner" />
              <div className="toolLoadingText">
                {isAudio ? "Generating audio…" : `Generating ${toolType}…`}
              </div>
              <div className="toolLoadingHint">
                {isAudio
                  ? "Writing script and converting to speech"
                  : isVideo
                  ? "Building slides and generating AI voice for each — this takes ~30 seconds"
                  : "LeeAI is crafting your content"}
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="toolError">
              <div className="toolErrorIcon">⚠️</div>
              <div>{error}</div>
            </div>
          )}

          {!isLoading && !error && isAudio && audioUrl && (
            <div className="audioPlayerWrap">
              <div className="audioPlayerIcon">🎙️</div>
              <div className="audioPlayerLabel">Your AI-generated audio summary is ready</div>
              <audio controls src={audioUrl} className="audioControl" />
              <a href={audioUrl} download="audio-summary.mp3" className="audioDownloadBtn">
                ⬇ Download MP3
              </a>
            </div>
          )}

          {!isLoading && !error && !isAudio && content && (
            renderContent(toolType, content, questionType)
          )}
        </div>

        {!isLoading && !error && hasContent && !isInteractive && (
          <div className="modalFooter">
            {!isAudio && (
              <button className="btnGhost" onClick={copyAll} type="button">
                {copied ? "Copied ✓" : "Copy all"}
              </button>
            )}
            <button className="btnPrimary" onClick={onClose} type="button">Done</button>
          </div>
        )}

        {!isLoading && !error && hasContent && isInteractive && (
          <div className="modalFooter">
            <button className="btnPrimary" onClick={onClose} type="button">Close</button>
          </div>
        )}

        {!isLoading && error && (
          <div className="modalFooter">
            <button className="btnPrimary" onClick={onClose} type="button">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
