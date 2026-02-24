import { useState, useRef, useEffect } from "react";

export default function VideoSummaryView({ content }) {
  const [data, setData]               = useState(null);
  const [parseError, setParseError]   = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying]     = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    try {
      setData(JSON.parse(content));
    } catch {
      setParseError(true);
    }
  }, [content]);

  // Cleanup on unmount
  useEffect(() => () => stopAudio(), []);

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
  }

  function playSlideAt(index, slides) {
    stopAudio();
    const slide = slides[index];
    if (!slide?.audioBase64) return;

    const audio = new Audio(`data:audio/mpeg;base64,${slide.audioBase64}`);
    audioRef.current = audio;

    audio.onended = () => {
      if (index < slides.length - 1) {
        setCurrentSlide(index + 1);
        playSlideAt(index + 1, slides);
      } else {
        setIsPlaying(false);
        audioRef.current = null;
      }
    };

    audio.play().catch(() => setIsPlaying(false));
    setIsPlaying(true);
  }

  function handlePlayPause() {
    if (!data) return;
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      playSlideAt(currentSlide, data.slides);
    }
  }

  function goTo(index) {
    stopAudio();
    setIsPlaying(false);
    setCurrentSlide(index);
  }

  if (parseError) {
    return (
      <div className="toolContent" style={{ padding: "16px", color: "rgba(255,255,255,0.5)" }}>
        Could not parse video data. The AI may have returned an unexpected format.
      </div>
    );
  }

  if (!data) return null;

  const slide = data.slides[currentSlide];
  const total = data.slides.length;

  return (
    <div className="vsWrap">
      {/* Header */}
      <div className="vsHeader">
        <div className="vsTopic">{data.topic}</div>
        <div className="vsSlideCount">{currentSlide + 1} / {total}</div>
      </div>

      {/* Slide */}
      <div className="vsSlide">
        <div className="vsSlideNum">SLIDE {currentSlide + 1}</div>
        <div className="vsSlideTitle">{slide.title}</div>
        <div className="vsBullets">
          {slide.bullets.map((b, i) => (
            <div key={i} className="vsBullet">
              <span className="vsBulletDot" />
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="vsProgressBar">
        <div
          className="vsProgressFill"
          style={{ width: `${((currentSlide + 1) / total) * 100}%` }}
        />
      </div>

      {/* Dot nav */}
      <div className="vsDots">
        {data.slides.map((_, i) => (
          <button
            key={i}
            className={`vsDot${i === currentSlide ? " vsDotActive" : ""}`}
            onClick={() => goTo(i)}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="vsControls">
        <button
          className="vsNavBtn"
          onClick={() => goTo(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          type="button"
        >
          ← Prev
        </button>
        <button className="vsPlayBtn" onClick={handlePlayPause} type="button">
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
        <button
          className="vsNavBtn"
          onClick={() => goTo(Math.min(total - 1, currentSlide + 1))}
          disabled={currentSlide === total - 1}
          type="button"
        >
          Next →
        </button>
      </div>

      {/* Narration */}
      <div className="vsNarration">
        <span className="vsNarrationLabel">Narration </span>
        {slide.narration}
      </div>
    </div>
  );
}
