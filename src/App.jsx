import { useEffect, useMemo, useRef, useState } from 'react';
import { BRAND, MEET_LINK, LIVE_SESSION, SESSIONS, RESOURCES, DEFAULT_TODOS, TOOLS } from './data.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const VIEWS = { overview: 'Overview', calendar: 'Calendar', resources: 'Resources', todos: 'To-dos', tools: 'Tools' };
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k) => new Date(k + 'T12:00:00');
const longDate = (k) => fromKey(k).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

// Figma exports (cohort page). Width/height are each file's pixel size.
const ICONS = {
  recording: { src: '/icons/recording.webp', w: 60, h: 83 },
  font: { src: '/icons/font.webp', w: 69, h: 86 },
  audio: { src: '/icons/audio.webp', w: 60, h: 83 },
  zip: { src: '/icons/zip.webp', w: 70, h: 95 },
  book: { src: '/icons/book.webp', w: 80, h: 101 },
};

function load(key, fallback) {
  try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch (e) { /* storage unavailable */ }
  return fallback;
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
}

/* ---------- Glyphs ---------- */
const Chevron = ({ dir, size = 18 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
  </svg>
);
const Grip = ({ faded }) => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill={faded ? '#d6d6e0' : '#8b8ca3'}>
    {[7, 12, 17].map((y) => (<g key={y}><circle cx="9" cy={y} r="1.6" /><circle cx="15" cy={y} r="1.6" /></g>))}
  </svg>
);
const Tick = ({ color = '#fff', size = 12, w = 3.4 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const VideoIcon = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><rect x="2" y="5.5" width="14" height="13" rx="3.2" fill="#ff4d8c" /><path d="M17 10.2l4.2-2.6c.6-.4 1.3.1 1.3.8v7.2c0 .7-.7 1.2-1.3.8L17 13.8z" fill="#ff4d8c" /></svg>
);
const UserAdd = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><circle cx="10" cy="7.5" r="4" /><path d="M2.5 19.2c0-3.6 3.4-6.2 7.5-6.2s7.5 2.6 7.5 6.2c0 .7-.5 1.3-1.2 1.3H3.7c-.7 0-1.2-.6-1.2-1.3z" /><path d="M19.5 7v6M16.5 10h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
);
function NavGlyph({ kind }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  switch (kind) {
    case 'overview': return (<svg {...p}><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></svg>);
    case 'calendar': return (<svg {...p}><rect x="3" y="4.5" width="18" height="16.5" rx="3" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></svg>);
    case 'resources': return (<svg {...p}><path d="M3 7a2.5 2.5 0 012.5-2.5h4l2 2.5h7A2.5 2.5 0 0121 9.5v8a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5z" /></svg>);
    case 'todos': return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.3l2.7 2.7L16.2 9.5" /></svg>);
    default: return (<svg {...p}><path d="M14.7 6.3a4 4 0 00-5.4 5.4L3.5 17.5a1.8 1.8 0 002.5 2.5l5.8-5.8a4 4 0 005.4-5.4l-2.5 2.5-2.5-2.5z" /></svg>);
  }
}

/* ---------- Modal: macOS window with traffic lights ---------- */
function Modal({ title, onClose, children }) {
  const [mode, setMode] = useState('normal'); // normal | mini | zoomed
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={'modal' + (mode !== 'normal' ? ' ' + mode : '')}>
        <div className="modal-bar">
          <div className="lights">
            <button type="button" className="light red" aria-label="Close" onClick={onClose}>
              <svg width="8" height="8" viewBox="0 0 8 8" stroke="#7a0f0a" strokeWidth="1.3" strokeLinecap="round"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" /></svg>
            </button>
            <button type="button" className="light yellow" aria-label={mode === 'mini' ? 'Restore' : 'Minimize'} onClick={() => setMode(mode === 'mini' ? 'normal' : 'mini')}>
              <svg width="8" height="8" viewBox="0 0 8 8" stroke="#8a5300" strokeWidth="1.4" strokeLinecap="round"><path d="M1.2 4h5.6" /></svg>
            </button>
            <button type="button" className="light green" aria-label={mode === 'zoomed' ? 'Exit full size' : 'Full size'} onClick={() => setMode(mode === 'zoomed' ? 'normal' : 'zoomed')}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="#0b5e10"><path d="M1.5 1.5h3.6L1.5 5.1zM6.5 6.5H2.9l3.6-3.6z" /></svg>
            </button>
          </div>
          <h2>{title}</h2>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Sections ---------- */
function Rings({ n = 14 }) {
  return <div className="rings" aria-hidden="true">{Array.from({ length: n }, (_, i) => <span key={i} />)}</div>;
}

function Calendar({ big, todayKey, onOpenDay }) {
  const now = new Date();
  const [ym, setYm] = useState(() => {
    const first = Object.keys(SESSIONS).sort().find((k) => k >= todayKey);
    const d = first ? fromKey(first) : now;
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const cells = useMemo(() => {
    const start = new Date(ym.y, ym.m, 1).getDay();
    const daysIn = new Date(ym.y, ym.m + 1, 0).getDate();
    const total = Math.ceil((start + daysIn) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(ym.y, ym.m, i - start + 1);
      const key = keyOf(d);
      const inMonth = d.getMonth() === ym.m;
      return { d, key, inMonth, session: inMonth ? SESSIONS[key] : null };
    });
  }, [ym]);
  const step = (n) => setYm(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });

  return (
    <section className={'card cal' + (big ? ' big' : '')} aria-labelledby="cal-h">
      <Rings />
      <div className="card-head">
        <h2 id="cal-h">{MONTHS[ym.m]}</h2>
        <div className="cal-nav">
          <button type="button" className="glass today-btn" onClick={() => setYm({ y: now.getFullYear(), m: now.getMonth() })}>Today</button>
          <div className="glass seg">
            <button type="button" aria-label="Previous month" onClick={() => step(-1)}><Chevron dir="left" size={16} /></button>
            <span className="div" aria-hidden="true" />
            <button type="button" aria-label="Next month" onClick={() => step(1)}><Chevron dir="right" size={16} /></button>
          </div>
        </div>
      </div>
      <div className="grid7">
        {DOW.map((d) => <div key={d} className="dow">{d}</div>)}
        {cells.map((c) => {
          const isToday = c.key === todayKey;
          const s = c.session;
          return (
            <button type="button" key={c.key}
              className={'cell' + (s ? ' has' : '') + (isToday ? ' today' : '')}
              onClick={() => onOpenDay(c.key)}
              aria-label={longDate(c.key) + (isToday ? ', today' : '') + (s ? ': ' + s.title : '')}>
              {isToday && (
                <span className={'today-mark' + (s ? ' top' : '')} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5b400"><circle cx="12" cy="12" r="5" /><g stroke="#f5b400" strokeWidth="2" strokeLinecap="round"><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></g></svg>
                  <span className="label">Today</span>
                </span>
              )}
              <span className={'num' + (s ? ' bold' : '') + (!c.inMonth ? ' out' : '')}>{c.d.getDate()}</span>
              {s && (
                <span className="tags">
                  {s.tags.map((t) => <span key={t.label} className="tag" style={{ background: t.color }}>{t.label}</span>)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FileArt({ icon }) {
  const i = ICONS[icon] || ICONS.zip;
  return <img src={i.src} width={i.w} height={i.h} alt="" />;
}

function Resources({ query, onOpen }) {
  const q = query.trim().toLowerCase();
  const items = RESOURCES.filter((r) => !q || r.name.toLowerCase().includes(q));
  return (
    <section className="card res" aria-labelledby="res-h">
      <div className="card-head"><h2 id="res-h">Resources</h2></div>
      <div className="files">
        {items.map((f) => (
          <button type="button" key={f.name} className="file" onClick={() => onOpen(f)} aria-label={`${f.name}, ${f.when}`}>
            <span className="art"><FileArt icon={f.icon} /></span>
            <span className="name">{f.name}</span>
            <span className="when">{f.when}</span>
          </button>
        ))}
      </div>
      {items.length === 0 && <p className="empty">No resources match your search.</p>}
    </section>
  );
}

function Todos({ todos, setTodos, query }) {
  const [draft, setDraft] = useState('');
  const q = query.trim().toLowerCase();
  const shown = todos.filter((t) => !q || t.text.toLowerCase().includes(q));
  const open = todos.filter((t) => !t.done).length;
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setDraft('');
  };
  const blanks = Math.max(0, 3 - shown.length);
  return (
    <section className="card todos" aria-labelledby="todo-h">
      <Rings />
      <div className="card-head">
        <h2 id="todo-h">To-dos</h2>
        <span className="count">{open} open</span>
      </div>
      <ul className="ruled">
        {shown.map((t) => (
          <li key={t.id} className={t.done ? 'done' : ''}>
            <span className="gutter">
              <button type="button" aria-pressed={t.done} aria-label={(t.done ? 'Mark not done: ' : 'Mark done: ') + t.text}
                onClick={() => setTodos(todos.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}>
                {t.done ? <Tick color="#191a2c" size={16} w={2.6} /> : <span style={{ width: 16, height: 16 }} />}
              </button>
            </span>
            <span className="text">{t.text}</span>
            <button type="button" className="x" aria-label={'Remove ' + t.text} onClick={() => setTodos(todos.filter((x) => x.id !== t.id))}>
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </li>
        ))}
        {Array.from({ length: blanks }, (_, i) => <li key={'b' + i} className="blank" aria-hidden="true"><span className="gutter" /></li>)}
        <li>
          <span className="gutter" />
          <label className="sr-only" htmlFor="new-todo">New to-do</label>
          <input id="new-todo" type="text" placeholder="Add a new todo" value={draft}
            onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
          <button type="button" className="add" onClick={add}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#0a64c8" /><path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
            Add
          </button>
        </li>
        <li className="blank" aria-hidden="true"><span className="gutter" /></li>
      </ul>
    </section>
  );
}

function Tools() {
  return (
    <section className="card tools" aria-labelledby="tools-h">
      <div className="card-head"><h2 id="tools-h">Tools</h2></div>
      <div className="tool-grid">
        {TOOLS.map((t) => (
          <a key={t.name} className="glass tool" href={t.href} target="_blank" rel="noreferrer">
            <span style={{ background: t.color }}>{t.mark}</span>{t.name}
          </a>
        ))}
      </div>
    </section>
  );
}

function SessionPanel({ todayKey, onOpenDay }) {
  const [copied, setCopied] = useState(false);
  const d = fromKey(LIVE_SESSION.date);
  const isLive = LIVE_SESSION.live;
  const upcoming = Object.keys(SESSIONS).sort().filter((k) => k >= todayKey && k !== LIVE_SESSION.date).slice(0, 4);
  const copy = () => {
    try { navigator.clipboard.writeText(MEET_LINK); } catch (e) { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <aside className="panel" aria-labelledby="session-h">
      <div className="panel-top">
        <div className="datechip" aria-label={d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}>
          <span className="m">{MONTHS[d.getMonth()].slice(0, 3).toUpperCase()}</span>
          <span className="d">{d.getDate()}</span>
        </div>
        <a className="join" href={MEET_LINK} target="_blank" rel="noreferrer"><UserAdd />Join In</a>
      </div>
      <div className="session">
        <p className="eyebrow">{isLive ? "Today\u2019s session" : 'Next session'}</p>
        <h2 id="session-h">{LIVE_SESSION.title}</h2>
        {isLive
          ? <div className="live-now"><VideoIcon />Live Now</div>
          : <div className="upcoming-when">{longDate(LIVE_SESSION.date)}</div>}
        <div className="meet">
          <span className="logo-tile"><img src="/icons/google-meet.webp" width="30" height="25" alt="" /></span>
          <div className="txt">
            <div className="t1">Google Meet Session</div>
            <div className="t2">Online Event</div>
          </div>
          <button type="button" className="copy" onClick={copy}>{copied ? 'Copied' : 'Copy Link'}</button>
        </div>
      </div>
      {upcoming.length > 0 && (
        <div className="coming">
          <h3 className="eyebrow">Coming up</h3>
          {upcoming.map((k) => (
            <button type="button" key={k} onClick={() => onOpenDay(k)}>
              <i style={{ background: SESSIONS[k].tags[0].color }} />
              <span className="l">{SESSIONS[k].title}</span>
              <span className="d mono">{fromKey(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

/* ---------- App ---------- */
export default function App() {
  const todayKey = keyOf(new Date());
  const [nav, setNav] = useState({ history: ['overview'], pos: 0 });
  const [query, setQuery] = useState('');
  const [todos, setTodos] = useState(() => load('cohort-todos', DEFAULT_TODOS));
  const [show, setShow] = useState(() => load('cohort-layout', { calendar: true, resources: true, todos: true, tools: false }));
  const [layoutOpen, setLayoutOpen] = useState(true);
  const [modal, setModal] = useState(null); // { type: 'resource', item } | { type: 'day', key }

  useEffect(() => save('cohort-todos', todos), [todos]);
  useEffect(() => save('cohort-layout', show), [show]);

  const view = nav.history[nav.pos];
  useEffect(() => { document.title = `${VIEWS[view]} · Cohort | ${BRAND}`; }, [view]);

  const go = (v) => setNav(({ history, pos }) => {
    if (history[pos] === v) return { history, pos };
    const h = history.slice(0, pos + 1).concat(v);
    return { history: h, pos: h.length - 1 };
  });
  const visible = (k) => (view === 'overview' ? show[k] : view === k);
  const openDay = (key) => setModal({ type: 'day', key });
  const openResource = (item) => setModal({ type: 'resource', item });
  const closeModal = () => setModal(null);

  const open = todos.filter((t) => !t.done).length;
  const navItems = [['overview', 'Overview'], ['calendar', 'Calendar'], ['resources', 'Resources', RESOURCES.length], ['todos', 'To-dos', open], ['tools', 'Tools']];
  const layoutItems = [['calendar', 'Calendar'], ['resources', 'Resources'], ['todos', 'To-dos'], ['tools', 'Tools']];

  return (
    <div className="app">
      <nav className="sidebar" aria-label="Main">
        <a className="logo" href="/">{BRAND}</a>

        <div className="nav">
          {navItems.map(([k, label, count]) => (
            <button key={k} type="button" className="nav-item" aria-current={view === k ? 'page' : undefined} onClick={() => go(k)}>
              <NavGlyph kind={k} /><span>{label}</span>
              {count !== undefined && <span className="count mono">{count}</span>}
            </button>
          ))}
        </div>

        <section className="layout" aria-labelledby="layout-h">
          <div className="layout-head">
            <h2 id="layout-h">Page Layout</h2>
            <button type="button" className="collapse" aria-expanded={layoutOpen} aria-label={layoutOpen ? 'Collapse page layout' : 'Expand page layout'} onClick={() => setLayoutOpen(!layoutOpen)}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2.5" y="2.5" width="15" height="15" rx="3.5" />{layoutOpen ? <path d="M6.5 10h7" strokeLinecap="round" /> : <path d="M6.5 10h7M10 6.5v7" strokeLinecap="round" />}</svg>
            </button>
          </div>
          {layoutOpen && (
            <ul>
              {layoutItems.map(([k, label]) => (
                <li key={k}>
                  <label className={show[k] ? '' : 'off'}>
                    <input type="checkbox" checked={show[k]} onChange={() => setShow({ ...show, [k]: !show[k] })} />
                    <span className={'check' + (show[k] ? ' on' : '')}>{show[k] && <Tick size={13} w={3.2} />}</span>
                    {label}
                  </label>
                  <span className="grip"><Grip faded={!show[k]} /></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </nav>

      <main className="main">
        <div className="toolbar">
          <button type="button" className="glass back" aria-label="Back" disabled={nav.pos === 0} onClick={() => setNav((n) => ({ ...n, pos: Math.max(0, n.pos - 1) }))}><Chevron dir="left" /></button>
          <label className="search">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span className="sr-only">Search</span>
            <input type="search" placeholder="Search anything here" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>

        {view !== 'overview' && <h1 className="view-title">{VIEWS[view]}</h1>}
        {view === 'overview' && <h1 className="sr-only">Overview</h1>}

        <div className={'cards' + (view !== 'overview' ? ' single' : '')}>
          {visible('calendar') && <Calendar big={view === 'calendar'} todayKey={todayKey} onOpenDay={openDay} />}
          {visible('resources') && <Resources query={query} onOpen={openResource} />}
          {visible('todos') && <Todos todos={todos} setTodos={setTodos} query={query} />}
          {visible('tools') && <Tools />}
        </div>
      </main>

      <SessionPanel todayKey={todayKey} onOpenDay={openDay} />

      {modal?.type === 'resource' && (
        <Modal title={modal.item.name} onClose={closeModal}>
          <div className="preview">
            <FileArt icon={modal.item.icon} />
            <h3>{modal.item.name}</h3>
            <dl className="meta-list">
              <dt>Kind</dt><dd>{modal.item.kind}</dd>
              <dt>Added</dt><dd>{modal.item.when}</dd>
              <dt>Cohort</dt><dd>DesignTales</dd>
            </dl>
          </div>
          <div className="modal-actions">
            <button type="button" className="glass btn" onClick={closeModal}>Close</button>
            <a className="btn primary" href={modal.item.href} target="_blank" rel="noreferrer">Open</a>
          </div>
        </Modal>
      )}

      {modal?.type === 'day' && (() => {
        const s = SESSIONS[modal.key];
        return (
          <Modal title={longDate(modal.key)} onClose={closeModal}>
            <div className="preview">
              {s ? (
                <>
                  <div className="session-tags">{s.tags.map((t) => <span key={t.label} className="tag" style={{ background: t.color }}>{t.label}</span>)}</div>
                  <h3>{s.title}</h3>
                  <p>{s.time} · Google Meet</p>
                </>
              ) : (
                <>
                  <h3>No session</h3>
                  <p>Nothing is scheduled for this day.</p>
                </>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="glass btn" onClick={closeModal}>Close</button>
              {s && <a className="btn primary" href={MEET_LINK} target="_blank" rel="noreferrer">Join on Meet</a>}
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
