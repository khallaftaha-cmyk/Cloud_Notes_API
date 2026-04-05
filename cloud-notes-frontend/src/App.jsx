import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Google Fonts ─────────────────────────────────────────────────────────── */
const FONTS = document.createElement("link");
FONTS.rel = "stylesheet";
FONTS.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Syne:wght@400;500;600&display=swap";
document.head.appendChild(FONTS);

/* ─── API ───────────────────────────────────────────────────────────────────── */
const BASE = "http://127.0.0.1:8000";

async function api(path, opts = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(BASE + path, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

async function login(email, password) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE}/login`, { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data; // { access_token, token_type }
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/* ─── Global styles ─────────────────────────────────────────────────────────── */
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: 'Syne', sans-serif;
    background: #f5f2ec;
    color: #1a1714;
  }

  :root {
    --bg:       #f5f2ec;
    --surface:  #edeae2;
    --border:   #d8d3c8;
    --ink:      #1a1714;
    --ink2:     #5a5650;
    --ink3:     #9a958e;
    --accent:   #b85c2a;
    --accent2:  #e8956a;
    --white:    #fdfcf9;
    --danger:   #b83232;
    --success:  #2a7a4a;
  }

  /* scrollbars */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* layout */
  .app { display: flex; height: 100vh; overflow: hidden; }

  /* ── Sidebar ── */
  .sidebar {
    width: 300px; min-width: 300px;
    background: var(--white);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  .sidebar-top {
    padding: 20px 18px 14px;
    border-bottom: 1px solid var(--border);
  }
  .brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px; font-weight: 600;
    color: var(--ink); letter-spacing: -0.5px;
    display: flex; align-items: center; gap: 8px;
  }
  .brand-dot {
    width: 9px; height: 9px;
    background: var(--accent); border-radius: 50%;
    flex-shrink: 0;
  }
  .user-email {
    font-size: 11px; color: var(--ink3);
    margin-top: 4px; margin-left: 17px;
  }

  .sidebar-actions {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 6px;
  }

  /* primary new-note button */
  .btn-new {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    background: var(--accent); color: var(--white);
    border: none; border-radius: 8px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: background .15s;
    width: 100%;
  }
  .btn-new:hover { background: #a04d22; }

  /* AI sidebar buttons */
  .btn-ai {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px;
    background: transparent;
    border: 1px solid var(--border); border-radius: 7px;
    font-family: 'Syne', sans-serif; font-size: 12px; color: var(--ink2);
    cursor: pointer; transition: all .15s; text-align: left; width: 100%;
  }
  .btn-ai:hover { background: var(--surface); border-color: var(--accent2); color: var(--accent); }
  .btn-ai:disabled { opacity: .45; cursor: not-allowed; }
  .btn-ai-icon { font-size: 14px; flex-shrink: 0; }

  .ai-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: 1.2px;
    text-transform: uppercase; color: var(--ink3);
    padding: 8px 14px 4px;
  }

  /* note list */
  .note-list { flex: 1; overflow-y: auto; padding: 6px 8px; }
  .note-count { font-size: 10px; color: var(--ink3); padding: 8px 14px 4px; letter-spacing: .5px; }
  .note-empty-list {
    text-align: center; padding: 40px 20px;
    font-size: 13px; color: var(--ink3);
  }

  .note-card {
    padding: 11px 13px; border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer; margin-bottom: 3px;
    transition: all .12s;
  }
  .note-card:hover { background: var(--surface); border-color: var(--border); }
  .note-card.active {
    background: #fdf0e8;
    border-color: var(--accent2);
  }
  .note-card-title {
    font-size: 13px; font-weight: 500; color: var(--ink);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .note-card-preview {
    font-size: 11px; color: var(--ink3); line-height: 1.5;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 5px;
  }
  .note-card-meta {
    display: flex; align-items: center; justify-content: space-between;
  }
  .note-card-date { font-size: 10px; color: var(--ink3); }
  .note-tags { display: flex; gap: 4px; flex-wrap: wrap; }
  .tag {
    font-size: 10px; padding: 1px 7px;
    background: #fde8d8; color: var(--accent);
    border-radius: 10px; font-weight: 500;
  }

  /* logout */
  .sidebar-bottom {
    padding: 10px 14px;
    border-top: 1px solid var(--border);
  }
  .btn-logout {
    width: 100%; padding: 8px;
    background: transparent; border: 1px solid var(--border); border-radius: 7px;
    font-family: 'Syne', sans-serif; font-size: 12px; color: var(--ink3);
    cursor: pointer; transition: all .15s;
  }
  .btn-logout:hover { border-color: var(--danger); color: var(--danger); }

  /* ── Main editor area ── */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }

  .toolbar {
    height: 54px; padding: 0 32px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    background: var(--white);
  }
  .btn-toolbar {
    padding: 7px 14px;
    border-radius: 7px; border: 1px solid var(--border);
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all .15s; background: transparent; color: var(--ink2);
    display: flex; align-items: center; gap: 6px;
  }
  .btn-toolbar:hover { background: var(--surface); color: var(--ink); }
  .btn-toolbar.save { background: var(--accent); color: var(--white); border-color: var(--accent); }
  .btn-toolbar.save:hover { background: #a04d22; }
  .btn-toolbar.save:disabled { opacity: .5; cursor: not-allowed; }
  .btn-toolbar.danger:hover { border-color: var(--danger); color: var(--danger); }
  .toolbar-gap { flex: 1; }
  .toolbar-status { font-size: 11px; color: var(--ink3); }
  .toolbar-error { font-size: 11px; color: var(--danger); }
  .toolbar-ok { font-size: 11px; color: var(--success); }

  /* editor */
  .editor-wrap { flex: 1; overflow-y: auto; padding: 52px 80px; }
  .editor-title-input {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px; font-weight: 600; line-height: 1.15;
    color: var(--ink); background: transparent; border: none; outline: none;
    width: 100%; resize: none; display: block;
    caret-color: var(--accent);
    margin-bottom: 28px;
    letter-spacing: -0.5px;
  }
  .editor-title-input::placeholder { color: #c8c3bb; }
  .editor-body-input {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 400; line-height: 1.9;
    color: var(--ink2); background: transparent; border: none; outline: none;
    width: 100%; resize: none; display: block; min-height: 480px;
    caret-color: var(--accent);
  }
  .editor-body-input::placeholder { color: #c8c3bb; }

  /* empty state */
  .empty-editor {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 14px; color: var(--ink3);
  }
  .empty-editor-glyph {
    font-family: 'Cormorant Garamond', serif;
    font-size: 72px; opacity: .12; line-height: 1; color: var(--accent);
  }
  .empty-editor-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; color: #c0bab2; font-style: italic;
  }
  .empty-editor-sub { font-size: 12px; color: var(--ink3); }

  /* ── Auth ── */
  .auth-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg);
  }
  .auth-card {
    width: 400px; background: var(--white);
    border: 1px solid var(--border); border-radius: 16px;
    padding: 44px 40px;
  }
  .auth-brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px; font-weight: 600; color: var(--ink);
    text-align: center; margin-bottom: 4px;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .auth-tagline { text-align: center; font-size: 12px; color: var(--ink3); margin-bottom: 32px; }

  .auth-tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 26px; }
  .auth-tab {
    flex: 1; padding: 10px; background: none; border: none;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    font-family: 'Syne', sans-serif; font-size: 13px; color: var(--ink3);
    cursor: pointer; transition: all .15s;
  }
  .auth-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 11px; font-weight: 600; letter-spacing: .5px; color: var(--ink3); margin-bottom: 6px; }
  .field input {
    width: 100%; padding: 10px 13px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; outline: none;
    font-family: 'Syne', sans-serif; font-size: 14px; color: var(--ink);
    transition: border-color .15s;
  }
  .field input:focus { border-color: var(--accent2); }

  .btn-submit {
    width: 100%; padding: 12px;
    background: var(--accent); color: var(--white); border: none;
    border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: background .15s; margin-top: 6px;
  }
  .btn-submit:hover { background: #a04d22; }
  .btn-submit:disabled { opacity: .5; cursor: not-allowed; }

  .form-error { font-size: 12px; color: var(--danger); margin-top: 10px; text-align: center; }

  /* ── Modal / Panel overlay ── */
  .overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(26,23,20,.55);
    display: flex; align-items: center; justify-content: center;
  }
  .modal {
    width: 520px; max-height: 82vh; overflow-y: auto;
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; padding: 36px;
  }
  .modal-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px; font-weight: 600; color: var(--ink);
    margin-bottom: 4px;
  }
  .modal-sub { font-size: 12px; color: var(--ink3); margin-bottom: 24px; }
  .modal-field { margin-bottom: 14px; }
  .modal-field label { display: block; font-size: 11px; font-weight: 600; letter-spacing: .5px; color: var(--ink3); margin-bottom: 5px; }
  .modal-field input, .modal-field textarea {
    width: 100%; padding: 10px 13px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; outline: none;
    font-family: 'Syne', sans-serif; font-size: 14px; color: var(--ink);
    transition: border-color .15s; resize: none;
  }
  .modal-field input:focus, .modal-field textarea:focus { border-color: var(--accent2); }

  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .btn-cancel {
    padding: 9px 18px; background: transparent;
    border: 1px solid var(--border); border-radius: 7px;
    font-family: 'Syne', sans-serif; font-size: 13px; color: var(--ink3);
    cursor: pointer; transition: all .15s;
  }
  .btn-cancel:hover { background: var(--surface); color: var(--ink); }
  .btn-ok {
    padding: 9px 18px; background: var(--accent); color: var(--white); border: none;
    border-radius: 7px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: background .15s;
  }
  .btn-ok:hover { background: #a04d22; }
  .btn-ok:disabled { opacity: .5; cursor: not-allowed; }

  /* AI result box */
  .ai-box {
    background: var(--surface); border: 1px solid var(--border);
    border-left: 3px solid var(--accent2);
    border-radius: 8px; padding: 16px; margin-top: 16px;
  }
  .ai-box-label {
    font-size: 10px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; color: var(--accent); margin-bottom: 10px;
  }
  .ai-box-text { font-size: 14px; color: var(--ink2); line-height: 1.75; }
  .ai-box-draft-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px; font-weight: 600; color: var(--ink);
    margin-bottom: 8px;
  }
  .ai-sources { font-size: 11px; color: var(--ink3); margin-top: 10px; }

  /* spinner */
  .spin {
    display: inline-block; width: 13px; height: 13px;
    border: 2px solid rgba(0,0,0,.12);
    border-top-color: currentColor;
    border-radius: 50%; animation: _spin .65s linear infinite;
  }
  @keyframes _spin { to { transform: rotate(360deg); } }

  /* toast */
  .toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 999;
    padding: 11px 20px; border-radius: 10px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 500;
    animation: _toast-in .2s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,.12);
  }
  .toast.ok { background: #f0faf4; border: 1px solid #a8dbb8; color: var(--success); }
  .toast.err { background: #fdf0f0; border: 1px solid #f0b8b8; color: var(--danger); }
  @keyframes _toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
`;
document.head.appendChild(style);

/* ─── Toast ─────────────────────────────────────────────────────────────────── */
function Toast({ msg, kind, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return <div className={`toast ${kind}`}>{msg}</div>;
}

/* ─── Spinner ────────────────────────────────────────────────────────────────── */
const Spin = () => <span className="spin" />;

/* ─── Auth Screen ────────────────────────────────────────────────────────────── */
function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError(""); setLoading(true);
    try {
      if (tab === "register") {
        await api("/users/", { method: "POST", body: JSON.stringify({ email, password: pw }) });
      }
      const { access_token } = await login(email, pw);
      onAuth(access_token, email);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const onKey = (e) => e.key === "Enter" && email && pw && submit();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><span className="brand-dot" />Cloud Notes</div>
        <div className="auth-tagline">Your AI-powered personal notebook</div>
        <div className="auth-tabs">
          {["login", "register"].map(t => (
            <button key={t} className={`auth-tab ${tab === t ? "active" : ""}`}
              onClick={() => { setTab(t); setError(""); }}>
              {t === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        <div className="field">
          <label>Email address</label>
          <input type="email" value={email} placeholder="you@example.com"
            onChange={e => setEmail(e.target.value)} onKeyDown={onKey} autoFocus />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={pw} placeholder="••••••••"
            onChange={e => setPw(e.target.value)} onKeyDown={onKey} />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn-submit" disabled={loading || !email || !pw} onClick={submit}>
          {loading ? <Spin /> : tab === "login" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}

/* ─── Ask Modal ──────────────────────────────────────────────────────────────── */
function AskModal({ token, onClose }) {
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask() {
    setError(""); setLoading(true); setResult(null);
    try {
      const data = await api("/notes/ask", { method: "POST", body: JSON.stringify({ question: q }) }, token);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">✦ Ask your notes</div>
        <div className="modal-sub">Ask a question — Claude searches across all your notes to answer.</div>
        <div className="modal-field">
          <label>Your question</label>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="What did I write about the project deadline?"
            onKeyDown={e => e.key === "Enter" && q && ask()} />
        </div>
        {result && (
          <div className="ai-box">
            <div className="ai-box-label">Answer</div>
            <div className="ai-box-text">{result.answer}</div>
            {result.relevant_note_ids?.length > 0 && (
              <div className="ai-sources">Referenced note IDs: {result.relevant_note_ids.join(", ")}</div>
            )}
          </div>
        )}
        {error && <div className="form-error" style={{ textAlign: "left", marginTop: 10 }}>{error}</div>}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Close</button>
          <button className="btn-ok" disabled={loading || !q} onClick={ask}>
            {loading ? <Spin /> : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Generate Modal ─────────────────────────────────────────────────────────── */
function GenerateModal({ token, onSave, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setError(""); setLoading(true); setDraft(null);
    try {
      const data = await api("/notes/generate",
        { method: "POST", body: JSON.stringify({ prompt }) }, token);
      setDraft(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function saveNote() {
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } catch (e) { setError(e.message); setSaving(false); }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">✎ Generate a note</div>
        <div className="modal-sub">Describe what you want to write — Claude will draft it for you.</div>
        <div className="modal-field">
          <label>Prompt</label>
          <textarea autoFocus rows={3} value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Write a summary of my Q2 goals focusing on growth metrics…" />
        </div>
        {draft && (
          <div className="ai-box">
            <div className="ai-box-label">Draft preview</div>
            <div className="ai-box-draft-title">{draft.title}</div>
            <div className="ai-box-text">{draft.content}</div>
          </div>
        )}
        {error && <div className="form-error" style={{ textAlign: "left", marginTop: 10 }}>{error}</div>}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          {!draft
            ? <button className="btn-ok" disabled={loading || !prompt} onClick={generate}>
                {loading ? <Spin /> : "Generate"}
              </button>
            : <>
                <button className="btn-cancel" onClick={() => setDraft(null)}>Regenerate</button>
                <button className="btn-ok" disabled={saving} onClick={saveNote}>
                  {saving ? <Spin /> : "Save as note"}
                </button>
              </>
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Summarise Modal ────────────────────────────────────────────────────────── */
function SummariseModal({ token, noteId, onClose }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/notes/${noteId}/summarise`, { method: "POST" }, token)
      .then(d => setSummary(d.summary))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">◈ Note summary</div>
        <div className="modal-sub">AI-generated summary of this note.</div>
        {loading && <div style={{ textAlign: "center", padding: "24px 0" }}><Spin /></div>}
        {summary && (
          <div className="ai-box">
            <div className="ai-box-label">Summary</div>
            <div className="ai-box-text">{summary}</div>
          </div>
        )}
        {error && <div className="form-error" style={{ textAlign: "left", marginTop: 10 }}>{error}</div>}
        <div className="modal-actions">
          <button className="btn-ok" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main App ───────────────────────────────────────────────────────────────── */
export default function App() {
  /* auth */
  const [token, setToken] = useState(() => localStorage.getItem("cn_token") || "");
  const [email, setEmail]  = useState(() => localStorage.getItem("cn_email") || "");

  /* notes */
  const [notes, setNotes]       = useState([]);
  const [selected, setSelected] = useState(null); // note object or null
  const [isNew, setIsNew]       = useState(false); // true when editing blank new note

  /* editor */
  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");
  const [dirty,   setDirty]   = useState(false);

  /* ui state */
  const [modal,     setModal]     = useState(null); // "ask"|"generate"|"summarise"|null
  const [tagLoading, setTagLoading] = useState(false);
  const [toast,     setToast]     = useState(null); // {msg, kind}
  const [saving,    setSaving]    = useState(false);
  const [toolbarErr, setToolbarErr] = useState("");

  const titleRef = useRef(null);

  /* ── auth ── */
  function onAuth(tok, em) {
    setToken(tok); setEmail(em);
    localStorage.setItem("cn_token", tok);
    localStorage.setItem("cn_email", em);
  }
  function logout() {
    localStorage.clear();
    setToken(""); setEmail("");
    setNotes([]); setSelected(null); setIsNew(false);
    setTitle(""); setContent(""); setDirty(false);
  }

  /* ── load notes ── */
  const loadNotes = useCallback(async () => {
    try {
      const data = await api("/notes/?limit=100", {}, token);
      setNotes(data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
    } catch (e) {
      if (e.message.toLowerCase().includes("401") || e.message.toLowerCase().includes("credential")) logout();
    }
  }, [token]);

  useEffect(() => { if (token) loadNotes(); }, [token]);

  /* ── select existing note ── */
  function selectNote(note) {
    setSelected(note); setIsNew(false);
    setTitle(note.title); setContent(note.content);
    setDirty(false); setToolbarErr("");
  }

  /* ── new note ── */
  function startNewNote() {
    setSelected(null); setIsNew(true);
    setTitle(""); setContent("");
    setDirty(false); setToolbarErr("");
    setTimeout(() => titleRef.current?.focus(), 50);
  }

  /* ── save (create or update) ── */
  async function saveNote() {
    if (!title.trim() && !content.trim()) {
      setToolbarErr("Add a title or content before saving.");
      return;
    }
    setToolbarErr(""); setSaving(true);
    const body = JSON.stringify({ title: title.trim() || "Untitled", content: content.trim() });
    try {
      if (selected) {
        // UPDATE  PUT /notes/{id}
        const updated = await api(`/notes/${selected.id}`, { method: "PUT", body }, token);
        setSelected(updated);
        setTitle(updated.title); setContent(updated.content);
        setNotes(prev =>
          prev.map(n => n.id === updated.id ? updated : n)
              .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        );
      } else {
        // CREATE  POST /notes/
        const created = await api("/notes/", { method: "POST", body }, token);
        setSelected(created); setIsNew(false);
        setTitle(created.title); setContent(created.content);
        setNotes(prev => [created, ...prev]);
      }
      setDirty(false);
      showToast("Saved", "ok");
    } catch (e) { setToolbarErr(e.message); }
    finally { setSaving(false); }
  }

  /* ── delete ── */
  async function deleteNote() {
    if (!selected) return;
    if (!window.confirm(`Delete "${selected.title}"? This cannot be undone.`)) return;
    try {
      await api(`/notes/${selected.id}`, { method: "DELETE" }, token);
      setNotes(prev => prev.filter(n => n.id !== selected.id));
      setSelected(null); setIsNew(false);
      setTitle(""); setContent(""); setDirty(false);
      showToast("Note deleted", "ok");
    } catch (e) { showToast(e.message, "err"); }
  }

  /* ── auto-tag ── */
  async function autoTag() {
    if (!selected) return;
    setTagLoading(true);
    try {
      // POST /notes/{id}/tags
      const data = await api(`/notes/${selected.id}/tags`, { method: "POST" }, token);
      const updated = { ...selected, tags: data.tags };
      setSelected(updated);
      setNotes(prev => prev.map(n => n.id === selected.id ? updated : n));
      showToast(`Tagged: ${data.tags.join(", ")}`, "ok");
    } catch (e) { showToast(e.message, "err"); }
    finally { setTagLoading(false); }
  }

  /* ── save generated draft ── */
  async function saveGenerated(draft) {
    const body = JSON.stringify({ title: draft.title, content: draft.content });
    const created = await api("/notes/", { method: "POST", body }, token);
    setNotes(prev => [created, ...prev]);
    selectNote(created);
    showToast("Note created from draft", "ok");
  }

  /* ── toast helper ── */
  function showToast(msg, kind) {
    setToast({ msg, kind });
  }

  /* ── editor visible ── */
  const editorVisible = isNew || selected !== null;

  if (!token) return <AuthScreen onAuth={onAuth} />;

  return (
    <div className="app">

      {/* ── Sidebar ── */}
      <div className="sidebar">
        <div className="sidebar-top">
          <div className="brand"><span className="brand-dot" />Cloud Notes</div>
          <div className="user-email">{email}</div>
        </div>

        <div className="sidebar-actions">
          {/* POST /notes/ */}
          <button className="btn-new" onClick={startNewNote}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New note
          </button>

          <div className="ai-section-label" style={{ padding: "10px 0 4px" }}>AI tools</div>

          {/* POST /notes/ask */}
          <button className="btn-ai" onClick={() => setModal("ask")}>
            <span className="btn-ai-icon">✦</span> Ask my notes
          </button>

          {/* POST /notes/generate */}
          <button className="btn-ai" onClick={() => setModal("generate")}>
            <span className="btn-ai-icon">✎</span> Generate a note
          </button>

          {/* POST /notes/{id}/summarise — only when a saved note is open */}
          {selected && (
            <button className="btn-ai" onClick={() => setModal("summarise")}>
              <span className="btn-ai-icon">◈</span> Summarise this note
            </button>
          )}

          {/* POST /notes/{id}/tags — only when a saved note is open */}
          {selected && (
            <button className="btn-ai" onClick={autoTag} disabled={tagLoading}>
              <span className="btn-ai-icon">◇</span>
              {tagLoading ? <><Spin /> Tagging…</> : "Auto-tag this note"}
            </button>
          )}
        </div>

        {/* Note list  GET /notes/ */}
        <div className="note-count">{notes.length} note{notes.length !== 1 ? "s" : ""}</div>
        <div className="note-list">
          {notes.length === 0
            ? <div className="note-empty-list">No notes yet.<br />Create your first one!</div>
            : notes.map(n => (
              <div key={n.id}
                className={`note-card ${selected?.id === n.id ? "active" : ""}`}
                onClick={() => selectNote(n)}>
                <div className="note-card-title">{n.title || "Untitled"}</div>
                <div className="note-card-preview">{n.content}</div>
                {n.tags?.length > 0 && (
                  <div className="note-tags" style={{ marginBottom: 5 }}>
                    {n.tags.slice(0, 4).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                )}
                <div className="note-card-meta">
                  <span className="note-card-date">{fmtDate(n.updated_at)}</span>
                </div>
              </div>
            ))
          }
        </div>

        <div className="sidebar-bottom">
          <button className="btn-logout" onClick={logout}>Sign out</button>
        </div>
      </div>

      {/* ── Editor ── */}
      <div className="main">
        {editorVisible ? (
          <>
            {/* Toolbar */}
            <div className="toolbar">
              {/* Save: POST /notes/ or PUT /notes/{id} */}
              <button className="btn-toolbar save" onClick={saveNote} disabled={saving}>
                {saving ? <Spin /> : "Save"}
              </button>

              {/* Delete: DELETE /notes/{id} */}
              {selected && (
                <button className="btn-toolbar danger" onClick={deleteNote}>
                  Delete
                </button>
              )}

              <div className="toolbar-gap" />

              {toolbarErr && <span className="toolbar-error">{toolbarErr}</span>}
              {dirty && !toolbarErr && <span className="toolbar-status">Unsaved changes</span>}
              {selected && !dirty && (
                <span className="toolbar-status">Last saved {fmtDate(selected.updated_at)}</span>
              )}
            </div>

            {/* Editor body */}
            <div className="editor-wrap">
              <textarea
                ref={titleRef}
                className="editor-title-input"
                rows={1}
                value={title}
                placeholder="Note title"
                onChange={e => { setTitle(e.target.value); setDirty(true); }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
              />
              <textarea
                className="editor-body-input"
                value={content}
                placeholder="Start writing…"
                onChange={e => { setContent(e.target.value); setDirty(true); }}
              />
            </div>
          </>
        ) : (
          <div className="empty-editor">
            <div className="empty-editor-glyph">✦</div>
            <div className="empty-editor-title">Nothing open</div>
            <div className="empty-editor-sub">Select a note or create a new one</div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal === "ask"       && <AskModal      token={token} onClose={() => setModal(null)} />}
      {modal === "generate"  && <GenerateModal token={token} onSave={saveGenerated} onClose={() => setModal(null)} />}
      {modal === "summarise" && selected && (
        <SummariseModal token={token} noteId={selected.id} onClose={() => setModal(null)} />
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} kind={toast.kind} onDone={() => setToast(null)} />}
    </div>
  );
}