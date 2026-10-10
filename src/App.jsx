import { useEffect, useMemo, useState } from 'react';
import { BRAND, MEET_LINK, LIVE_SESSION, SESSIONS, RESOURCES, DEFAULT_TODOS, TOOLS } from './data.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const TITLES = { overview: 'Overview', calendar: 'Calendar', resources: 'Resources', todos: 'To-dos', live: 'Live Session', tools: 'Tools' };
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k) => new Date(k + 'T12:00:00');

function loadTodos() {
  try {
    const raw = localStorage.getItem('cohort-todos');
    if (raw) return JSON.parse(raw);
  } catch (e) { /* storage unavailable */ }
  return DEFAULT_TODOS;
}

/* ---------- Icons ---------- */
const Chevron = ({ dir, size = 20, w = 2.2 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
  </svg>
);
const Folder = ({ w = 26, h = 22, back = '#7d93b8', front = '#9db1d1' }) => (
  <svg aria-hidden="true" width={w} height={h} viewBox="0 0 26 22">
    <path d="M1 4a3 3 0 013-3h6l2.5 3H22a3 3 0 013 3v11a3 3 0 01-3 3H4a3 3 0 01-3-3z" fill={back} />
    <path d="M1 8h24v10a3 3 0 01-3 3H4a3 3 0 01-3-3z" fill={front} />
  </svg>
);
const MeetLogo = ({ w = 28, h = 22 }) => (
  <svg aria-hidden="true" width={w} height={h} viewBox="0 0 34 28">
    <rect x="0" y="0" width="22" height="28" rx="4" fill="#2684fc" />
    <rect x="0" y="0" width="11" height="14" rx="3" fill="#ea4335" />
    <rect x="11" y="14" width="11" height="14" fill="#00ac47" />
    <rect x="11" y="0" width="11" height="14" fill="#ffba00" />
    <path d="M22 9l12-8v26l-12-8z" fill="#00832d" />
  </svg>
);
function SideIcon({ kind, day }) {
  switch (kind) {
    case 'overview':
      return (<svg aria-hidden="true" width="30" height="22" viewBox="0 0 30 22"><rect x="1" y="1" width="28" height="20" rx="3" fill="#5f8fd9" /><rect x="1" y="1" width="28" height="4" rx="2" fill="#2f5fa8" /><rect x="9" y="15" width="3" height="2" rx="1" fill="#ff5f57" /><rect x="13.5" y="15" width="3" height="2" rx="1" fill="#28c840" /><rect x="18" y="15" width="3" height="2" rx="1" fill="#febc2e" /></svg>);
    case 'calendar':
      return (<svg aria-hidden="true" width="26" height="26" viewBox="0 0 26 26"><rect x="1" y="2" width="24" height="23" rx="4" fill="#fff" stroke="#c9ccd3" /><path d="M1 6a4 4 0 014-4h16a4 4 0 014 4v3H1z" fill="#ff453a" /><text x="13" y="21" textAnchor="middle" fontFamily="Geist, sans-serif" fontSize="11" fontWeight="600" fill="#1d1d1f">{day}</text></svg>);
    case 'resources':
      return <Folder w={28} h={22} back="#5a86c9" front="#7aa3df" />;
    case 'todos':
      return (<svg aria-hidden="true" width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="#ff9f0a" /><path d="M8 13.5l3.5 3.5L18.5 9.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case 'live':
      return (<svg aria-hidden="true" width="28" height="20" viewBox="0 0 28 20"><rect x="1" y="2" width="18" height="16" rx="4" fill="#2b2b2e" /><rect x="4" y="5" width="12" height="10" rx="2" fill="#4fa3ff" /><path d="M20 7l7-4v14l-7-4z" fill="#2b2b2e" /></svg>);
    default:
      return (<svg aria-hidden="true" width="26" height="26" viewBox="0 0 26 26"><path d="M4 23l10-10" stroke="#3a3a3c" strokeWidth="3.2" strokeLinecap="round" /><path d="M12 5l5-3 7 7-3 5-3-3-2 2-4-4 2-2z" fill="#6e6e73" /></svg>);
  }
}

/* ---------- Sections ---------- */
function Calendar({ big, todayKey }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(null);

  const cells = useMemo(() => {
    const start = new Date(ym.y, ym.m, 1).getDay();
    const daysIn = new Date(ym.y, ym.m + 1, 0).getDate();
    const total = Math.ceil((start + daysIn) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(ym.y, ym.m, i - start + 1);
      const key = keyOf(d);
      const inMonth = d.getMonth() === ym.m;
      return { d, key, inMonth, tags: inMonth ? SESSIONS[key] || [] : [] };
    });
  }, [ym]);

  const step = (n) => setYm(({ y, m }) => {
    const d = new Date(y, m + n, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  let foot = 'Select a day to see its session.';
  if (selected) {
    const tags = SESSIONS[selected];
    foot = fromKey(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) +
      ' — ' + (tags ? tags.map((x) => x.label).join(' · ') : 'No session scheduled');
  }

  return (
    <section className={'card cal' + (big ? ' big' : '')} aria-labelledby="cal-h">
      <div className="card-head">
        <h2 id="cal-h">{MONTHS[ym.m]} <span>{ym.y}</span></h2>
        <div className="cal-tools">
          <button type="button" className="glass pill-btn today" onClick={() => { setYm({ y: now.getFullYear(), m: now.getMonth() }); setSelected(todayKey); }}>Today</button>
          <div className="glass seg cal-seg">
            <button type="button" aria-label="Previous month" onClick={() => step(-1)}><Chevron dir="left" size={16} w={2.4} /></button>
            <span className="div" aria-hidden="true" />
            <button type="button" aria-label="Next month" onClick={() => step(1)}><Chevron dir="right" size={16} w={2.4} /></button>
          </div>
        </div>
      </div>
      <div className="grid7">
        {DOW.map((d) => <div key={d} className="dow">{d}</div>)}
        {cells.map((c) => {
          const isToday = c.key === todayKey;
          return (
            <button
              type="button"
              key={c.key}
              className={'cell' + (c.key === selected ? ' sel' : '')}
              onClick={() => setSelected(c.key)}
              aria-label={c.d.toDateString() + (isToday ? ', today' : '') + (c.tags.length ? ': ' + c.tags.map((t) => t.label).join(', ') : '')}
            >
              <span className={'num' + (isToday ? ' today' : '') + (!c.inMonth ? ' out' : '')}>{c.d.getDate()}</span>
              <span className="tags">
                {c.tags.map((t) => (
                  <span key={t.label} className="tag" style={{ color: t.ink, background: t.soft }}>
                    <i style={{ background: t.color }} />{t.label}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <div className="cal-foot" aria-live="polite">{foot}</div>
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
  return (
    <section className="card todos" aria-labelledby="todo-h">
      <div className="card-head">
        <h2 id="todo-h">To-dos</h2>
        <span className="total mono">{open}</span>
      </div>
      <ul>
        {shown.map((t) => (
          <li key={t.id} className="todo">
            <button type="button" className="icon-btn lead" aria-pressed={t.done}
              aria-label={(t.done ? 'Mark not done: ' : 'Mark done: ') + t.text}
              onClick={() => setTodos(todos.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}>
              <span className={'ring' + (t.done ? ' done' : '')}>
                {t.done && (<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>)}
              </span>
            </button>
            <span className={'todo-text' + (t.done ? ' done' : '')}>{t.text}</span>
            <button type="button" className="icon-btn" aria-label={'Remove ' + t.text}
              onClick={() => setTodos(todos.filter((x) => x.id !== t.id))}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </li>
        ))}
        <li className="todo">
          <button type="button" className="icon-btn lead" aria-label="Add to-do" onClick={add}>
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#ff9f0a" /><path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
          </button>
          <label>
            <span className="sr-only">New to-do</span>
            <input type="text" placeholder="New To-do" value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
          </label>
        </li>
      </ul>
    </section>
  );
}

function Resources({ query }) {
  const q = query.trim().toLowerCase();
  const items = RESOURCES.filter((r) => !q || r.name.toLowerCase().includes(q));
  return (
    <section className="card res" aria-labelledby="res-h">
      <div className="card-head">
        <h2 id="res-h">Resources</h2>
        <span className="meta">{items.length} items</span>
      </div>
      <div className="files">
        {items.map((f) => (
          <a key={f.name} className="file" href={f.href} aria-label={`${f.name}, ${f.when}`}>
            {f.folder ? <Folder w={84} h={70} back="#7d93b8" front="#a3b6d4" /> : (
              <span className="thumb mono" style={{ background: f.fill, color: f.ink }}>{f.mark}</span>
            )}
            <span className="name">{f.name}</span>
            <span className="when">{f.when}</span>
          </a>
        ))}
      </div>
      {items.length === 0 && <p className="empty">No resources match your search.</p>}
    </section>
  );
}

function Live({ todayKey }) {
  const [copied, setCopied] = useState(false);
  const upcoming = Object.keys(SESSIONS).filter((k) => k >= todayKey).slice(0, 3);
  const copy = () => {
    try { navigator.clipboard.writeText(MEET_LINK); } catch (e) { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <section className="card live" aria-labelledby="live-h">
      <div className="card-head">
        <div className="datechip">
          <div className="m">{LIVE_SESSION.month}</div>
          <div className="d">{LIVE_SESSION.day}</div>
        </div>
        <a className="join" href={MEET_LINK} target="_blank" rel="noreferrer">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="4" /><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M19 8v6M16 11h6" /></svg>
          Join In
        </a>
      </div>
      <div>
        <h2 id="live-h">{LIVE_SESSION.title}</h2>
        <div className="now"><i />Live Now</div>
      </div>
      <div className="meet">
        <span className="logo"><MeetLogo /></span>
        <div className="txt">
          <div className="t1">Google Meet Session</div>
          <div className="t2">Online Event</div>
        </div>
        <button type="button" className="glass pill-btn" onClick={copy}>{copied ? 'Copied' : 'Copy Link'}</button>
      </div>
      <div>
        <h3>Coming up</h3>
        {upcoming.length === 0 && <p className="empty">No upcoming sessions.</p>}
        {upcoming.map((k) => (
          <div key={k} className="up">
            <i style={{ background: SESSIONS[k][0].color }} />
            <span className="l">{SESSIONS[k].map((x) => x.label).join(' · ')}</span>
            <span className="d mono">{fromKey(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Tools() {
  return (
    <section className="card tools" aria-labelledby="tools-h">
      <h2 id="tools-h">Tools</h2>
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

/* ---------- App ---------- */
export default function App() {
  const now = new Date();
  const todayKey = keyOf(now);
  const [nav, setNav] = useState({ history: ['overview'], pos: 0 });
  const [win, setWin] = useState({ closed: false, min: false, full: false });
  const [query, setQuery] = useState('');
  const [todos, setTodos] = useState(loadTodos);

  useEffect(() => {
    try { localStorage.setItem('cohort-todos', JSON.stringify(todos)); } catch (e) { /* storage unavailable */ }
  }, [todos]);

  const view = nav.history[nav.pos];
  useEffect(() => { document.title = `${TITLES[view]} · Cohort | ${BRAND}`; }, [view]);

  const go = (v) => setNav(({ history, pos }) => {
    if (history[pos] === v) return { history, pos };
    const h = history.slice(0, pos + 1).concat(v);
    return { history: h, pos: h.length - 1 };
  });

  const open = todos.filter((t) => !t.done).length;
  const groups = [
    { title: 'Favorites', items: [['overview', 'Overview'], ['calendar', 'Calendar'], ['resources', 'Resources', RESOURCES.length], ['todos', 'To-dos', open]] },
    { title: 'Cohort', items: [['live', 'Live Session'], ['tools', 'Tools']] },
  ];
  const show = (v) => view === 'overview' ? v !== 'tools' : view === v;

  if (win.closed) {
    return (
      <div className="desk">
        <div className="closed">
          <p>The window is closed.</p>
          <button type="button" className="glass pill-btn" onClick={() => setWin({ closed: false, min: false, full: false })}>Reopen Cohort</button>
        </div>
      </div>
    );
  }

  return (
    <div className={'desk' + (win.full ? ' full' : '')}>
      <div className={'window' + (win.min ? ' min' : '')}>
        <header className="titlebar">
          <div className="lights">
            <button type="button" className="light red" aria-label="Close window" onClick={() => setWin({ ...win, closed: true })} />
            <button type="button" className="light yellow" aria-label={win.min ? 'Restore window' : 'Minimize window'} onClick={() => setWin({ ...win, min: !win.min })} />
            <button type="button" className="light green" aria-label={win.full ? 'Exit full screen' : 'Enter full screen'} onClick={() => setWin({ ...win, full: !win.full, min: false })} />
          </div>
          <div className="glass seg nav-seg">
            <button type="button" aria-label="Back" disabled={nav.pos === 0} onClick={() => setNav((n) => ({ ...n, pos: Math.max(0, n.pos - 1) }))}><Chevron dir="left" /></button>
            <span className="div" aria-hidden="true" />
            <button type="button" aria-label="Forward" disabled={nav.pos >= nav.history.length - 1} onClick={() => setNav((n) => ({ ...n, pos: Math.min(n.history.length - 1, n.pos + 1) }))}><Chevron dir="right" /></button>
          </div>
          <div className="title">
            <Folder />
            <h1>{TITLES[view]}</h1>
          </div>
          <label className="search">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span className="sr-only">Search</span>
            <input type="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </header>

        {!win.min && (
          <div className="body">
            <nav className="sidebar" aria-label="Sections">
              {groups.map((g) => (
                <div key={g.title} className="side-group">
                  <h2>{g.title}</h2>
                  {g.items.map(([k, label, count]) => (
                    <button key={k} type="button" className="side-item" aria-current={view === k ? 'page' : undefined} onClick={() => go(k)}>
                      <span className="ico"><SideIcon kind={k} day={now.getDate()} /></span>
                      <span className="label">{label}</span>
                      {count !== undefined && <span className="count mono">{count}</span>}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
            <main className="content">
              {show('calendar') && <Calendar big={view === 'calendar'} todayKey={todayKey} />}
              {show('todos') && <Todos todos={todos} setTodos={setTodos} query={query} />}
              {show('resources') && <Resources query={query} />}
              {show('live') && <Live todayKey={todayKey} />}
              {show('tools') && <Tools />}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
