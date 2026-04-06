import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are a world-class Fashion Brand Consultant and Chief Strategy Officer. You have been retained exclusively to build KIMIA — a women's fashion brand — from the ground up.

## YOUR MANDATE
You are not a chatbot. You are a strategic partner. Your role right now is Phase 1: Vision Alignment & Discovery. You are conducting a high-level strategic brand interview. Your goal is to develop a comprehensive, precise understanding of Kimia before any strategy or planning begins.

## STRICT RULES YOU MUST FOLLOW
1. Ask questions in small, logically grouped batches of 2–3 questions maximum. NEVER dump a list of 10+ questions at once.
2. WAIT for the founder's response before asking the next batch. Do not jump ahead.
3. Ask highly targeted, strategic questions — not generic or basic ones. Every question should feel like it came from a senior brand strategist who has built luxury fashion houses.
4. Do NOT ask about or plan for textile handling, fabric sourcing, or physical supply chain logistics. We are strictly in the conceptual, branding, and strategy phase.
5. Do not give advice, feedback, or commentary on their answers yet. Your only job right now is to LISTEN and ASK. You may briefly acknowledge their answer warmly before asking the next batch — but do NOT editorialize or advise.
6. Once you have gathered enough information across all four discovery areas (Brand Identity, Market Positioning, Pricing Strategy, Current Stage), tell the founder you have enough to draft the Brand Vision Document, and ask for their permission to generate it.
7. When asked to generate the Brand Vision Document: produce a beautifully structured, comprehensive document that synthesizes everything the founder has told you. Use elegant formatting. Title it "KIMIA — Brand Vision Document." This is NOT a generic template — it should be entirely personalized to their exact words and vision.
8. After producing the document, ask: "Does this accurately capture your vision for Kimia? Is there anything you'd like me to refine before we move to Phase 2?"
9. Do NOT begin Phase 2 (Task Execution & Roadmapping) until the founder explicitly approves the Brand Vision Document.

## DISCOVERY AREAS TO COVER
- Brand Identity: Core ethos, aesthetic direction, design language, cultural influences
- Market Positioning: Target woman, competitive landscape, where Kimia sits vs. existing brands
- Pricing Strategy: Premium vs. accessible luxury, price point philosophy
- Founder's Vision: The emotional why, long-term dream, what success looks like in 3–5 years

## YOUR TONE
Confident. Refined. Intellectually serious. Warm but precise. Every sentence has weight.

## OPENING MESSAGE
Begin by acknowledging the parameters clearly and professionally. Then open with your first batch of 2–3 questions focused on Brand Identity.`;

function parseContent(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("# ")) return <h1 key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 300, color: "#1a1a1a", letterSpacing: "0.12em", margin: "1.2rem 0 0.5rem", textTransform: "uppercase" }}>{line.slice(2)}</h1>;
    if (line.startsWith("## ")) return <h2 key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 400, color: "#1a1a1a", letterSpacing: "0.1em", margin: "1rem 0 0.4rem", textTransform: "uppercase", borderBottom: "1px solid #d4c4a8", paddingBottom: "0.3rem" }}>{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontWeight: 600, color: "#4a3728", letterSpacing: "0.08em", margin: "0.8rem 0 0.2rem", textTransform: "uppercase" }}>{line.slice(4)}</h3>;
    if (line.startsWith("---")) return <hr key={i} style={{ border: "none", borderTop: "1px solid #e8ddd0", margin: "1rem 0" }} />;
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const content = line.slice(2);
      const parts = content.split(/\*\*(.*?)\*\*/g);
      return <div key={i} style={{ display: "flex", gap: "0.6rem", margin: "0.3rem 0", alignItems: "flex-start" }}><span style={{ color: "#c4a882", flexShrink: 0, fontSize: "0.7rem" }}>◆</span><span style={{ color: "#3d3028", fontSize: "0.875rem", lineHeight: 1.7 }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#1a1a1a", fontWeight: 600 }}>{p}</strong> : p)}</span></div>;
    }
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.+)/);
      if (match) {
        const parts = match[2].split(/\*\*(.*?)\*\*/g);
        return <div key={i} style={{ display: "flex", gap: "0.6rem", margin: "0.3rem 0" }}><span style={{ color: "#c4a882", fontWeight: 600, flexShrink: 0, fontSize: "0.8rem", minWidth: "1.2rem" }}>{match[1]}.</span><span style={{ color: "#3d3028", fontSize: "0.875rem", lineHeight: 1.7 }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#1a1a1a" }}>{p}</strong> : p)}</span></div>;
      }
    }
    if (line.trim() === "") return <div key={i} style={{ height: "0.45rem" }} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <p key={i} style={{ color: "#3d3028", fontSize: "0.875rem", lineHeight: 1.8, margin: "0.15rem 0", fontFamily: "'Crimson Text', Georgia, serif" }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#1a1a1a", fontWeight: 600 }}>{p}</strong> : p)}</p>;
  });
}

const PHASES = [
  { id: "discovery", label: "Discovery", num: "I" },
  { id: "vision", label: "Vision Doc", num: "II" },
  { id: "strategy", label: "Strategy", num: "III" },
  { id: "execution", label: "Execution", num: "IV" },
];

export default function KimiaConsultant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [activePhase] = useState("discovery");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startSession = async () => {
    setLoading(true);
    setStarted(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: "I understand these parameters. Please acknowledge and begin Phase 1 with your first set of questions." }],
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("\n") || "";
      setMessages([{ role: "assistant", content: reply }]);
    } catch {
      setMessages([{ role: "assistant", content: "Something went wrong. Please check your API key in Vercel environment variables." }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("\n") || "";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!started) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Crimson Text', Georgia, serif", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(196,168,130,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(196,168,130,0.05) 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "1px", height: "30vh", background: "linear-gradient(to bottom, transparent, #d4c4a8, transparent)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: "1px", height: "30vh", background: "linear-gradient(to bottom, transparent, #d4c4a8, transparent)" }} />
        <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: "480px", padding: "2rem" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.35em", color: "#c4a882", marginBottom: "1rem", textTransform: "uppercase" }}>Atelier Consulting</div>
            <div style={{ fontSize: "4.5rem", fontFamily: "'Cormorant Garamond', Garamond, serif", fontWeight: 300, letterSpacing: "0.2em", color: "#1a1a1a", lineHeight: 1, textTransform: "uppercase" }}>Kimia</div>
            <div style={{ width: "80px", height: "1px", background: "linear-gradient(to right, transparent, #c4a882, transparent)", margin: "1rem auto" }} />
            <div style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#7a6a55", textTransform: "uppercase" }}>Brand Vision Studio</div>
          </div>
          <p style={{ color: "#5a4a38", fontSize: "1rem", lineHeight: 1.8, marginBottom: "2.5rem", fontStyle: "italic" }}>A strategic partnership to build your women's fashion brand from concept to identity — with precision, intention, and depth.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0", marginBottom: "2.5rem" }}>
            {PHASES.map((phase, i) => (
              <div key={phase.id} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center", padding: "0 0.8rem" }}>
                  <div style={{ fontSize: "0.6rem", fontFamily: "serif", color: "#c4a882", marginBottom: "0.2rem" }}>{phase.num}</div>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: phase.id === "discovery" ? "#1a1a1a" : "#b0a090", textTransform: "uppercase" }}>{phase.label}</div>
                </div>
                {i < PHASES.length - 1 && <div style={{ width: "20px", height: "1px", background: "#d4c4a8" }} />}
              </div>
            ))}
          </div>
          <button onClick={startSession} style={{ padding: "0.9rem 3rem", background: "#1a1a1a", border: "none", color: "#f5f0e8", fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Crimson Text', Georgia, serif", transition: "all 0.3s" }}
            onMouseEnter={e => { e.target.style.background = "#4a3728"; }}
            onMouseLeave={e => { e.target.style.background = "#1a1a1a"; }}>
            Begin the Discovery
          </button>
          <div style={{ marginTop: "1rem", fontSize: "0.65rem", color: "#b0a090", letterSpacing: "0.1em" }}>Phase I · Vision Alignment & Discovery</div>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", flexDirection: "column", fontFamily: "'Crimson Text', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d4c4a8; border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        textarea::placeholder { color: #b0a090; font-style: italic; }
      `}</style>

      <div style={{ borderBottom: "1px solid #e0d5c5", background: "#f5f0e8", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 300, letterSpacing: "0.15em", color: "#1a1a1a", textTransform: "uppercase" }}>Kimia</span>
          <span style={{ width: "1px", height: "16px", background: "#d4c4a8", display: "inline-block" }} />
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.18em", color: "#c4a882", textTransform: "uppercase" }}>Brand Vision Studio</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {PHASES.map((phase, i) => (
            <div key={phase.id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ padding: "0.25rem 0.7rem", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: phase.id === activePhase ? "#1a1a1a" : "#b0a090", borderBottom: phase.id === activePhase ? "1px solid #1a1a1a" : "1px solid transparent", fontWeight: phase.id === activePhase ? 600 : 400 }}>{phase.label}</div>
              {i < PHASES.length - 1 && <div style={{ width: "12px", height: "1px", background: "#d4c4a8" }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "2.5rem", maxWidth: "760px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {loading && messages.length === 0 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "#c4a882", textTransform: "uppercase", marginBottom: "0.5rem" }}>Preparing your session</div>
              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#c4a882", animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "2rem", animation: "fadeUp 0.4s ease" }}>
            {msg.role === "assistant" ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.8rem" }}>
                  <div style={{ width: "22px", height: "22px", border: "1px solid #c4a882", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", color: "#c4a882", transform: "rotate(45deg)" }}>
                    <span style={{ transform: "rotate(-45deg)" }}>K</span>
                  </div>
                  <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#c4a882", textTransform: "uppercase" }}>Chief Strategy Office · Kimia</span>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e8ddd0", borderRadius: "0 12px 12px 12px", padding: "1.5rem 1.8rem", boxShadow: "0 2px 12px rgba(196,168,130,0.08)" }}>
                  {parseContent(msg.content)}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "#b0a090", textTransform: "uppercase" }}>You · Founder</span>
                  </div>
                  <div style={{ background: "#1a1a1a", borderRadius: "12px 12px 0 12px", padding: "1rem 1.3rem", maxWidth: "520px" }}>
                    <p style={{ color: "#f0e8d8", fontSize: "0.9rem", lineHeight: 1.7, margin: 0, fontFamily: "'Crimson Text', Georgia, serif" }}>{msg.content}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && messages.length > 0 && (
          <div style={{ marginBottom: "2rem", animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.8rem" }}>
              <div style={{ width: "22px", height: "22px", border: "1px solid #c4a882", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", color: "#c4a882", transform: "rotate(45deg)" }}>
                <span style={{ transform: "rotate(-45deg)" }}>K</span>
              </div>
              <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#c4a882", textTransform: "uppercase" }}>Composing response</span>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e8ddd0", borderRadius: "0 12px 12px 12px", padding: "1.2rem 1.8rem", display: "inline-flex", gap: "6px", alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#c4a882", animation: `blink 1.2s ease-in-out ${i * 0.25}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ borderTop: "1px solid #e0d5c5", background: "#f5f0e8", padding: "1.2rem 2.5rem 1.5rem", maxWidth: "760px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ background: "#fff", border: "1px solid #d4c4a8", borderRadius: "4px", padding: "0.9rem 1.1rem", display: "flex", gap: "0.75rem", alignItems: "flex-end", boxShadow: "0 2px 8px rgba(196,168,130,0.06)" }}>
          <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Share your vision…" rows={1}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#1a1a1a", fontSize: "0.95rem", lineHeight: 1.7, resize: "none", fontFamily: "'Crimson Text', Georgia, serif", fontStyle: "italic", minHeight: "28px", maxHeight: "140px" }}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            style={{ padding: "0.4rem 1.2rem", background: input.trim() && !loading ? "#1a1a1a" : "#e8ddd0", border: "none", color: input.trim() && !loading ? "#f5f0e8" : "#b0a090", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: input.trim() && !loading ? "pointer" : "default", fontFamily: "'Crimson Text', Georgia, serif", transition: "all 0.2s", flexShrink: 0, borderRadius: "2px" }}>
            Send
          </button>
        </div>
        <div style={{ marginTop: "0.5rem", textAlign: "center", fontSize: "0.6rem", color: "#c4a882", letterSpacing: "0.12em", textTransform: "uppercase" }}>Phase I · Vision Alignment & Discovery</div>
      </div>
    </div>
  );
}
