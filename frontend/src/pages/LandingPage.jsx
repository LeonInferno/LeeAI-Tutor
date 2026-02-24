import { useNavigate } from "react-router-dom";

const TOOLS = [
  { icon: "🎙️", name: "Audio Summary",  desc: "Turn notes into spoken audio you can listen to anywhere." },
  { icon: "🎬", name: "Video Summary",   desc: "AI-narrated slides that teach your content — play it like a video." },
  { icon: "🗺️", name: "Concept Map",    desc: "See how ideas connect in a structured visual tree." },
  { icon: "📖", name: "Study Guide",    desc: "Get a clean, organized guide with key concepts and definitions." },
  { icon: "🃏", name: "Flashcards",     desc: "Quizlet-style flip cards — question front, answer back." },
  { icon: "📝", name: "Quiz",           desc: "Multiple choice or short answer — you set the count." },
  { icon: "📊", name: "Infographic",    desc: "Visual layout of stats, sections, and key takeaways." },
  { icon: "📑", name: "Slide Deck",     desc: "Auto-generated slides with titles and bullet points." },
  { icon: "💡", name: "Key Facts",      desc: "12 bite-sized facts pulled from your material." },
];

const FEATURES = [
  {
    icon: "📂",
    title: "Add any source",
    desc: "Paste text, drop a URL, or upload a PDF or TXT file. LeeAI reads it all and uses it as context for every tool.",
    accent: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.26)",
  },
  {
    icon: "🤖",
    title: "AI-powered tools",
    desc: "Nine specialized study tools — each designed for a different way of learning, all powered by the latest AI.",
    accent: "rgba(96,165,250,0.10)",
    border: "rgba(96,165,250,0.24)",
  },
  {
    icon: "💬",
    title: "Chat with your notes",
    desc: "Ask LeeAI anything about your sources. Get instant explanations, examples, and deeper insights.",
    accent: "rgba(125,211,252,0.09)",
    border: "rgba(125,211,252,0.22)",
  },
  {
    icon: "🎯",
    title: "Built to make you learn",
    desc: "Not just summaries — interactive flashcards, auto-graded quizzes, and slides that keep you engaged.",
    accent: "rgba(147,197,253,0.09)",
    border: "rgba(147,197,253,0.22)",
  },
];

const STEPS = [
  { num: "01", title: "Add your sources", desc: "Paste notes, upload a PDF, or share a link. LeeMind reads your material instantly." },
  { num: "02", title: "Chat or generate", desc: "Ask questions in chat, or pick a tool — flashcards, quiz, concept map, and more." },
  { num: "03", title: "Study smarter", desc: "Flip cards, take quizzes, listen to audio — review your material your way." },
];

export default function LandingPage() {
  const nav = useNavigate();

  return (
    <div className="landingShell">
      {/* ── NAV ── */}
      <nav className="landingNav">
        <div className="landingNavBrand">
          {/* Drop your logo.png into frontend/public/ and it will appear here */}
          <img src="/LeeMind Logo.png" alt="LeeMind logo" className="landingLogo" />
          <span className="landingBrandName">LeeMind</span>
        </div>
        <div className="landingNavLinks">
          <a href="#features" className="landingNavLink">Features</a>
          <a href="#tools" className="landingNavLink">Tools</a>
          <a href="#how" className="landingNavLink">How it works</a>
        </div>
        <div className="landingNavActions">
          <button className="landingBtnLogin" onClick={() => nav("/app")}>Log in</button>
          <button className="landingBtnSignup" onClick={() => nav("/app")}>Sign up free →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landingHero">
        <div className="landingHeroBadge">✨ Powered by AI</div>
        <h1 className="landingHeroTitle">
          Learn anything,<br />
          <span className="landingHeroGradient">faster than ever.</span>
        </h1>
        <p className="landingHeroSub">
          LeeMind turns your notes, PDFs, and links into interactive flashcards, quizzes,
          concept maps, audio summaries, and more — in seconds.
        </p>
        <div className="landingHeroCta">
          <button className="landingBtnSignup landingBtnLg" onClick={() => nav("/app")}>
            Get started free →
          </button>
          <button className="landingBtnGhost landingBtnLg" onClick={() => nav("/app")}>
            Open my notebooks
          </button>
        </div>

        {/* Floating tool pills */}
        <div className="landingHeroPills">
          {TOOLS.map(t => (
            <div key={t.name} className="landingPill">
              <span>{t.icon}</span> {t.name}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="landingSection" id="features">
        <div className="landingSectionLabel">Why LeeMind?</div>
        <h2 className="landingSectionTitle">Everything you need to study smarter</h2>
        <div className="landingFeaturesGrid">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="landingFeatureCard"
              style={{ background: f.accent, borderColor: f.border }}
            >
              <div className="landingFeatureIcon">{f.icon}</div>
              <div className="landingFeatureTitle">{f.title}</div>
              <div className="landingFeatureDesc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section className="landingSection" id="tools">
        <div className="landingSectionLabel">9 study tools</div>
        <h2 className="landingSectionTitle">One source. Nine ways to learn it.</h2>
        <div className="landingToolsGrid">
          {TOOLS.map(t => (
            <div key={t.name} className="landingToolCard">
              <div className="landingToolIcon">{t.icon}</div>
              <div className="landingToolName">{t.name}</div>
              <div className="landingToolDesc">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landingSection" id="how">
        <div className="landingSectionLabel">Simple by design</div>
        <h2 className="landingSectionTitle">How it works</h2>
        <div className="landingStepsRow">
          {STEPS.map((s, i) => (
            <div key={s.num} className="landingStep">
              <div className="landingStepNum">{s.num}</div>
              <div className="landingStepTitle">{s.title}</div>
              <div className="landingStepDesc">{s.desc}</div>
              {i < STEPS.length - 1 && <div className="landingStepArrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="landingCtaBanner">
        <h2 className="landingCtaTitle">Ready to learn differently?</h2>
        <p className="landingCtaSub">Start for free. No credit card required.</p>
        <button className="landingBtnSignup landingBtnLg" onClick={() => nav("/app")}>
          Open LeeMind free →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landingFooter">
        <div className="landingFooterBrand">
          <img src="/LeeMind Logo.png" alt="LeeMind" className="landingLogoSm" />
          <span className="landingFooterName">LeeMind</span>
        </div>
        <div className="landingFooterCopy">© {new Date().getFullYear()} LeeMind. Built to help you learn.</div>
      </footer>
    </div>
  );
}
