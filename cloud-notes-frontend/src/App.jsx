import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8000";

const fonts = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');`;

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d1117; color: #e8e2d9; font-family: 'DM Sans', sans-serif; min-height: 100vh; }

  :root {
    --ink: #0d1117;
    --ink-2: #161d27;
    --ink-3: #1e2733;
    --amber: #d4943a;
    --amber-dim: #a06e25;
    --amber-glow: rgba(212,148,58,0.12);
    --cream: #e8e2d9;
    --muted: #8a8278;
    --border: rgba(232,226,217,0.08);
    --border-hover: rgba(232,226,217,0.18);
    --danger: #c0392b;
  }

  .app { display: flex; height: 100vh; overflow: hidden; }

  /* Sidebar */
  .sidebar {
    width: 280px; min-width: 280px; background: var(--ink-2);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    overflow: hidden;
  }
  .sidebar-header {
    padding: 24px 20px 16px; border-bottom: 1px solid var(--border);
  }
  .logo {
    font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700;
    color: var(--cream); letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px;
  }
  .logo-dot { width: 8px; height: 8px; background: var(--amber); border-radius: 50%; }
  .sidebar-user {
    margin-top: 10px; font-size: 12px; color: var(--muted); letter-spacing: 0.3px;
  }

  .new-note-btn {
    margin: 14px 16px; padding: 10px 14px; background: var(--amber); color: var(--ink);
    border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px;
    font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: background 0.15s; letter-spacing: 0.2px;
  }
  .new-note-btn:hover { background: #e8a84a; }

  .ai-actions {
    padding: 0 16px 12px; display: flex; flex-direction: column; gap: 6px;
  }
  .ai-actions-label {
    font-size: 10px; font-weight: 500; color: var(--muted); letter-spacing: 1px;
    text-transform: uppercase; margin-bottom: 2px;
  }
  .ai-btn {
    padding: 8px 12px; background: transparent; border: 1px solid var(--border);
    border-radius: 7px; color: var(--cream); font-family: 'DM Sans', sans-serif;
    font-size: 12px; cursor: pointer; text-align: left; display: flex; align-items: center;
    gap: 8px; transition: all 0.15s;
  }
  .ai-btn:hover { background: var(--amber-glow); border-color: var(--amber-dim); color: var(--amber); }
  .ai-btn-icon { font-size: 14px; }

  .note-list { flex: 1; overflow-y: auto; padding: 8px; }
  .note-list::-webkit-scrollbar { width: 4px; }
  .note-list::-webkit-scrollbar-track { background: transparent; }
  .note-list::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 4px; }

  .note-item {
    padding: 12px 14px; border-radius: 8px; cursor: pointer; margin-bottom: 2px;
    border: 1px solid transparent; transition: all 0.12s; position: relative;
  }
  .note-item:hover { background: var(--ink-3); border-color: var(--border); }
  .note-item.active { background: var(--amber-glow); border-color: var(--amber-dim); }
  .note-item-title { font-size: 13px; font-weight: 500; color: var(--cream); margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .note-item-preview { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.5; }
  .note-item-date { font-size: 10px; color: var(--muted); margin-top: 5px; opacity: 0.7; }
  .note-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 5px; }
  .tag { font-size: 10px; padding: 1px 6px; background: var(--amber-glow); color: var(--amber); border-radius: 10px; }

  /* Main content */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--ink); }

  .toolbar {
    height: 52px; border-bottom: 1px solid var(--border); display: flex; align-items: center;
    padding: 0 24px; gap: 10px; background: var(--ink);
  }
  .toolbar-btn {
    padding: 6px 12px; background: transparent; border: 1px solid var(--border);
    border-radius: 6px; color: var(--muted); font-family: 'DM Sans', sans-serif;
    font-size: 12px; cursor: pointer; transition: all 0.12s; display: flex; align-items: center; gap: 5px;
  }
  .toolbar-btn:hover { border-color: var(--border-hover); color: var(--cream); }
  .toolbar-btn.danger:hover { border-color: var(--danger); color: var(--danger); }
  .toolbar-btn.primary { background: var(--amber); color: var(--ink); border-color: var(--amber); font-weight: 500; }
  .toolbar-btn.primary:hover { background: #e8a84a; }
  .toolbar-spacer { flex: 1; }
  .save-status { font-size: 11px; color: var(--muted); }

  .editor-area { flex: 1; overflow-y: auto; padding: 48px 64px; }
  .editor-area::-webkit-scrollbar { width: 6px; }
  .editor-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  .editor-title {
    font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700;
    color: var(--cream); background: transparent; border: none; width: 100%;
    outline: none; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 24px;
    caret-color: var(--amber);
  }
  .editor-title::placeholder { color: rgba(232,226,217,0.2); }

  .editor-content {
    font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 300;
    color: rgba(232,226,217,0.8); background: transparent; border: none;
    width: 100%; outline: none; resize: none; line-height: 1.85; min-height: 420px;
    caret-color: var(--amber);
  }
  .editor-content::placeholder { color: rgba(232,226,217,0.15); }

  /* Empty state */
  .empty-state {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 12px; color: var(--muted);
  }
  .empty-state-icon { font-size: 48px; opacity: 0.3; }
  .empty-state-title { font-family: 'Playfair Display', serif; font-size: 20px; color: rgba(232,226,217,0.3); }
  .empty-state-sub { font-size: 13px; }

  /* Auth screen */
  .auth-screen {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--ink); position: relative; overflow: hidden;
  }
  .auth-bg {
    position: absolute; inset: 0; background:
      radial-gradient(ellipse 60% 50% at 70% 50%, rgba(212,148,58,0.06) 0%, transparent 70%);
  }
  .auth-card {
    width: 380px; background: var(--ink-2); border: 1px solid var(--border);
    border-radius: 16px; padding: 40px; position: relative; z-index: 1;
  }
  .auth-logo {
    font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700;
    color: var(--cream); text-align: center; margin-bottom: 6px;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .auth-sub { text-align: center; color: var(--muted); font-size: 13px; margin-bottom: 32px; }
  .auth-tabs { display: flex; gap: 0; margin-bottom: 28px; border-bottom: 1px solid var(--border); }
  .auth-tab {
    flex: 1; padding: 10px; background: transparent; border: none; border-bottom: 2px solid transparent;
    color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer;
    transition: all 0.15s; margin-bottom: -1px;
  }
  .auth-tab.active { color: var(--amber); border-bottom-color: var(--amber); }

  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; letter-spacing: 0.3px; }
  .field input {
    width: 100%; padding: 10px 14px; background: var(--ink-3); border: 1px solid var(--border);
    border-radius: 8px; color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.15s;
  }
  .field input:focus { border-color: var(--amber-dim); }

  .submit-btn {
    width: 100%; padding: 12px; background: var(--amber); border: none; border-radius: 8px;
    color: var(--ink); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: background 0.15s; margin-top: 8px;
  }
  .submit-btn:hover { background: #e8a84a; }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Panels */
  .panel {
    position: fixed; inset: 0; background: rgba(13,17,23,0.85); z-index: 100;
    display: flex; align-items: center; justify-content: center;
  }
  .panel-card {
    width: 540px; background: var(--ink-2); border: 1px solid var(--border);
    border-radius: 16px; padding: 32px; max-height: 80vh; overflow-y: auto;
  }
  .panel-title {
    font-family: 'Playfair Display', serif; font-size: 20px; color: var(--cream);
    margin-bottom: 6px;
  }
  .panel-sub { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
  .panel-field { margin-bottom: 16px; }
  .panel-field label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
  .panel-field input, .panel-field textarea {
    width: 100%; padding: 10px 14px; background: var(--ink-3); border: 1px solid var(--border);
    border-radius: 8px; color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.15s; resize: none;
  }
  .panel-field input:focus, .panel-field textarea:focus { border-color: var(--amber-dim); }
  .panel-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
  .panel-btn-cancel {
    padding: 9px 18px; background: transparent; border: 1px solid var(--border);
    border-radius: 7px; color: var(--muted); font-family: 'DM Sans', sans-serif;
    font-size: 13px; cursor: pointer; transition: all 0.12s;
  }
  .panel-btn-cancel:hover { border-color: var(--border-hover); color: var(--cream); }
  .panel-btn-ok {
    padding: 9px 18px; background: var(--amber); border: none; border-radius: 7px;
    color: var(--ink); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: background 0.12s;
  }
  .panel-btn-ok:hover { background: #e8a84a; }
  .panel-btn-ok:disabled { opacity: 0.5; cursor: not-allowed; }

  .ai-result {
    background: var(--ink-3); border: 1px solid var(--border); border-radius: 8px;
    padding: 16px; font-size: 14px; color: var(--cream); line-height: 1.7; margin-top: 16px;
  }
  .ai-result-label {
    font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--amber);
    margin-bottom: 10px; font-weight: 500;
  }

  .error-msg { color: #e74c3c; font-size: 12px; margin-top: 8px; }
  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2); border-top-color: var(--amber); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .note-count { font-size: 11px; color: var(--muted); padding: 8px 20px 4px; }
`;

// ── API helpers ────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Auth Screen ────────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNew, setIsNew] = useState(false);

  async function handleSubmit() {
    setError(""); setLoading(true);
    try {
      if (tab === "register") {
        await apiFetch("/users/", { method: "POST", body: JSON.stringify({ email, password }) });
      }
      const form = new URLSearchParams({ username: email, password });
      const data = await fetch(`${API_BASE}/login`, { method: "POST", body: form }).then(r => r.json());
      if (!data.access_token) throw new Error(data.detail || "Login failed");
      onAuth(data.access_token, email);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo"><span className="logo-dot" />Cloud Notes</div>
        <div className="auth-sub">Your AI-powered personal notebook</div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Sign in</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>Create account</button>
        </div>
        <div className="field">
          <label>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="submit-btn" onClick={handleSubmit} disabled={loading || !email || !password}>
          {loading ? <span className="spinner" /> : tab === "login" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}

// ── Ask Panel ─────────────────────────────────────────────────────────────────

function AskPanel({ token, onClose }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    setError(""); setLoading(true); setResult(null);
    try {
      const data = await apiFetch("/notes/ask", { method: "POST", body: JSON.stringify({ question }) }, token);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="panel" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="panel-card">
        <div className="panel-title">✦ Ask your notes</div>
        <div className="panel-sub">Ask anything — Claude will search across all your notes to answer.</div>
        <div className="panel-field">
          <label>Your question</label>
          <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="What did I write about the project deadline?" onKeyDown={e => e.key === "Enter" && question && handleAsk()} autoFocus />
        </div>
        {result && (
          <div className="ai-result">
            <div className="ai-result-label">Answer</div>
            <div>{result.answer}</div>
            {result.relevant_note_ids?.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 11, color: "var(--muted)" }}>
                Referenced notes: #{result.relevant_note_ids.join(", #")}
              </div>
            )}
          </div>
        )}
        {error && <div className="error-msg">{error}</div>}
        <div className="panel-actions">
          <button className="panel-btn-cancel" onClick={onClose}>Close</button>
          <button className="panel-btn-ok" onClick={handleAsk} disabled={loading || !question}>
            {loading ? <span className="spinner" /> : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generate Panel ────────────────────────────────────────────────────────────

function GeneratePanel({ token, onSave, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setError(""); setLoading(true); setDraft(null);
    try {
      const data = await apiFetch("/notes/generate", { method: "POST", body: JSON.stringify({ prompt }) }, token);
      setDraft(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="panel" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="panel-card">
        <div className="panel-title">✦ Generate a note</div>
        <div className="panel-sub">Describe what you want to write and Claude will draft it for you.</div>
        <div className="panel-field">
          <label>Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} placeholder="Write a summary of my Q2 goals focusing on growth metrics..." autoFocus />
        </div>
        {draft && (
          <div className="ai-result">
            <div className="ai-result-label">Draft</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, marginBottom: 8 }}>{draft.title}</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>{draft.content}</div>
          </div>
        )}
        {error && <div className="error-msg">{error}</div>}
        <div className="panel-actions">
          <button className="panel-btn-cancel" onClick={onClose}>Cancel</button>
          {!draft
            ? <button className="panel-btn-ok" onClick={handleGenerate} disabled={loading || !prompt}>
                {loading ? <span className="spinner" /> : "Generate"}
              </button>
            : <button className="panel-btn-ok" onClick={() => { onSave(draft); onClose(); }}>
                Save as note
              </button>
          }
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("cn_token") || "");
  const [userEmail, setUserEmail] = useState(() => sessionStorage.getItem("cn_email") || "");
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [panel, setPanel] = useState(null); // "ask" | "generate" | null
  const [aiLoading, setAiLoading] = useState("");
  const [error, setError] = useState("");

  function onAuth(t, email) {
    setToken(t); setUserEmail(email);
    sessionStorage.setItem("cn_token", t);
    sessionStorage.setItem("cn_email", email);
  }

  function logout() {
    sessionStorage.clear(); setToken(""); setUserEmail("");
    setNotes([]); setSelected(null);
  }

  const loadNotes = useCallback(async () => {
    try {
      const data = await apiFetch("/notes/?limit=100", {}, token);
      setNotes(data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
    } catch (e) { if (e.message.includes("401")) logout(); }
  }, [token]);

  useEffect(() => { if (token) loadNotes(); }, [token]);

  function selectNote(note) {
    setSelected(note); setTitle(note.title); setContent(note.content); setDirty(false); setError(""); setIsNew(false);
  }

  function newNote() {
    setSelected(null); setTitle(""); setContent(""); setDirty(false); setError("");
  }

  async function saveNote() {
    setError("");
    const body = JSON.stringify({ title: title || "Untitled", content });
    try {
      if (selected) {
        const updated = await apiFetch(`/notes/${selected.id}`, { method: "PUT", body }, token);
        setSelected(updated);
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
      } else {
        const created = await apiFetch("/notes/", { method: "POST", body }, token);
        setSelected(created); setTitle(created.title); setContent(created.content);
        setNotes(prev => [created, ...prev]);
      }
      setIsNew(false); // add this
      setDirty(false); setSaveStatus("Saved"); setTimeout(() => setSaveStatus(""), 2000);
    } catch (e) { setError(e.message); }
  }

  async function deleteNote() {
    if (!selected || !window.confirm("Delete this note?")) return;
    await apiFetch(`/notes/${selected.id}`, { method: "DELETE" }, token);
    setNotes(prev => prev.filter(n => n.id !== selected.id));
    newNote();
  }

  async function summariseNote() {
    if (!selected) return;
    setAiLoading("summarise");
    try {
      const data = await apiFetch(`/notes/${selected.id}/summarise`, { method: "POST" }, token);
      alert(`Summary:\n\n${data.summary}`);
    } catch (e) { setError(e.message); }
    finally { setAiLoading(""); }
  }

  async function tagNote() {
    if (!selected) return;
    setAiLoading("tag");
    try {
      const data = await apiFetch(`/notes/${selected.id}/tags`, { method: "POST" }, token);
      setSelected(prev => ({ ...prev, tags: data.tags }));
      setNotes(prev => prev.map(n => n.id === selected.id ? { ...n, tags: data.tags } : n));
    } catch (e) { setError(e.message); }
    finally { setAiLoading(""); }
  }

  async function saveGeneratedNote(draft) {
    const body = JSON.stringify({ title: draft.title, content: draft.content });
    const created = await apiFetch("/notes/", { method: "POST", body }, token);
    setNotes(prev => [created, ...prev]);
    selectNote(created);
  }

  if (!token) return (
    <>
      <style>{fonts}{css}</style>
      <AuthScreen onAuth={onAuth} />
    </>
  );

  return (
    <>
      <style>{fonts}{css}</style>
      <div className="app">

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="logo"><span className="logo-dot" />Cloud Notes</div>
            <div className="sidebar-user">{userEmail}</div>
          </div>

          <button className="new-note-btn" onClick={newNote}>
            <span style={{ fontSize: 16 }}>+</span> New note
          </button>

          <div className="ai-actions">
            <div className="ai-actions-label">AI Tools</div>
            <button className="ai-btn" onClick={() => setPanel("ask")}>
              <span className="ai-btn-icon">✦</span> Ask my notes
            </button>
            <button className="ai-btn" onClick={() => setPanel("generate")}>
              <span className="ai-btn-icon">✎</span> Generate a note
            </button>
            {selected && (
              <>
                <button className="ai-btn" onClick={summariseNote} disabled={!!aiLoading}>
                  <span className="ai-btn-icon">◈</span>
                  {aiLoading === "summarise" ? <span className="spinner" /> : "Summarise note"}
                </button>
                <button className="ai-btn" onClick={tagNote} disabled={!!aiLoading}>
                  <span className="ai-btn-icon">◇</span>
                  {aiLoading === "tag" ? <span className="spinner" /> : "Auto-tag note"}
                </button>
              </>
            )}
          </div>

          {notes.length > 0 && <div className="note-count">{notes.length} note{notes.length !== 1 ? "s" : ""}</div>}

          <div className="note-list">
            {notes.map(note => (
              <div key={note.id} className={`note-item ${selected?.id === note.id ? "active" : ""}`} onClick={() => selectNote(note)}>
                <div className="note-item-title">{note.title || "Untitled"}</div>
                <div className="note-item-preview">{note.content}</div>
                {note.tags?.length > 0 && (
                  <div className="note-tags">
                    {note.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                )}
                <div className="note-item-date">{fmtDate(note.updated_at)}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
            <button className="ai-btn" style={{ width: "100%", justifyContent: "center", color: "var(--muted)" }} onClick={logout}>
              Sign out
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="main">
           {selected !== null || title || content || isNew ? (
            <>
              <div className="toolbar">
                <button className="toolbar-btn primary" onClick={saveNote}>Save</button>
                {selected && (
                  <button className="toolbar-btn danger" onClick={deleteNote}>Delete</button>
                )}
                <div className="toolbar-spacer" />
                {error && <span className="error-msg">{error}</span>}
                {saveStatus && <span className="save-status">{saveStatus}</span>}
                {dirty && !saveStatus && <span className="save-status">Unsaved changes</span>}
              </div>
              <div className="editor-area">
                <textarea
                  className="editor-title"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setDirty(true); }}
                  placeholder="Note title"
                  rows={1}
                  onInput={e => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                />
                <textarea
                  className="editor-content"
                  value={content}
                  onChange={e => { setContent(e.target.value); setDirty(true); }}
                  placeholder="Start writing…"
                />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">✦</div>
              <div className="empty-state-title">Nothing selected</div>
              <div className="empty-state-sub">Choose a note or create a new one</div>
            </div>
          )}
        </div>

        {/* Panels */}
        {panel === "ask" && <AskPanel token={token} onClose={() => setPanel(null)} />}
        {panel === "generate" && <GeneratePanel token={token} onSave={saveGeneratedNote} onClose={() => setPanel(null)} />}
      </div>
    </>
  );
}
