import { useEffect, useMemo, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon, ArrowRight01Icon, ArrowUpRight01Icon, Book02Icon, Calendar03Icon, CalendarAdd01Icon,
  Cancel01Icon, CheckmarkCircle02Icon, Clock01Icon, DashboardSquare01Icon, DragDropVerticalIcon, FileAudioIcon,
  FileVideoIcon, FileZipIcon, Folder01Icon, Link04Icon, MinusSignSquareIcon, Mortarboard01Icon, PlusSignIcon, AlertCircleIcon,
  PlusSignSquareIcon, Search01Icon, Sun03Icon, TextFontIcon, Tick02Icon, UserAdd01Icon, UserMultiple02Icon,
  Video01Icon, Wrench01Icon,
} from '@hugeicons/core-free-icons';
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

/* ---------- Icons (Hugeicons) ----------
   Outline: 1px stroke at any size. Bold: 2px, for selected and primary states. */
function Icon({ icon, size = 20, bold = false, ...rest }) {
  return <HugeiconsIcon icon={icon} size={size} color="currentColor" strokeWidth={bold ? 2 : 1} absoluteStrokeWidth={!bold} aria-hidden="true" focusable="false" {...rest} />;
}
const NAV_ICONS = { overview: DashboardSquare01Icon, calendar: Calendar03Icon, resources: Folder01Icon, todos: CheckmarkCircle02Icon, tools: Wrench01Icon };
const KIND_ICONS = { recording: FileVideoIcon, font: TextFontIcon, audio: FileAudioIcon, zip: FileZipIcon, book: Book02Icon };

function downloadIcs(key, s) {
  const d = key.replace(/-/g, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Paulelite//DesignTales//EN', 'BEGIN:VEVENT',
    'UID:' + d + '@paulelite.me', 'DTSTART;VALUE=DATE:' + d, 'SUMMARY:' + s.title,
    'DESCRIPTION:DesignTales cohort session \u00b7 ' + s.time + '\\n' + MEET_LINK, 'LOCATION:' + MEET_LINK,
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a'); a.href = url; a.download = s.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.ics'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    try { navigator.clipboard.writeText(text); } catch (e) { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return [copied, copy];
}

/* ---------- Modal: macOS window with traffic lights ---------- */
function Modal({ title, onClose, footer, children }) {
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
        {footer && <div className="modal-foot">{footer}</div>}
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
        <div className="glass seg cal-nav">
          <button type="button" aria-label="Previous month" onClick={() => step(-1)}><Icon icon={ArrowLeft01Icon} size={18} /></button>
          <span className="div" aria-hidden="true" />
          <button type="button" className="today-btn" onClick={() => setYm({ y: now.getFullYear(), m: now.getMonth() })}>Today</button>
          <span className="div" aria-hidden="true" />
          <button type="button" aria-label="Next month" onClick={() => step(1)}><Icon icon={ArrowRight01Icon} size={18} /></button>
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
                  <Icon icon={Sun03Icon} size={14} bold style={{ color: '#d99a00' }} />
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

/* ---------- To-dos: paper card with an add flow ----------
   Add flow states: idle → editing (focused) → filled (Add enabled) → error (empty or duplicate)
   → added (new row highlights, field stays open for the next one). Esc or blur-when-empty closes. */
const TODO_MAX = 80;
function Todos({ todos, setTodos, query }) {
  const [editing, setEditing] = useState(false);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);
  const [justAdded, setJustAdded] = useState(null);
  const [announce, setAnnounce] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { if (editing) inputRef.current?.focus({ preventScroll: true }); }, [editing]);

  const q = query.trim().toLowerCase();
  const shown = todos.filter((t) => !q || t.text.toLowerCase().includes(q));
  const done = todos.filter((t) => t.done).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  const fail = (msg) => { setError(msg); setShake((n) => n + 1); inputRef.current?.focus({ preventScroll: true }); };
  const add = () => {
    const text = draft.trim();
    if (!text) return fail('Type something first');
    if (todos.some((t) => !t.done && t.text.toLowerCase() === text.toLowerCase())) return fail('That\u2019s already on your list');
    const id = Date.now();
    setTodos([...todos, { id, text, done: false }]);
    setDraft(''); setError(''); setJustAdded(id); setAnnounce('Added ' + text);
    setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 1400);
    inputRef.current?.focus({ preventScroll: true });
  };
  const close = () => { setDraft(''); setError(''); setEditing(false); setFocused(false); };
  const toggle = (t) => { setTodos(todos.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x))); setAnnounce((t.done ? 'Reopened ' : 'Completed ') + t.text); };
  const remove = (t) => { setTodos(todos.filter((x) => x.id !== t.id)); setAnnounce('Removed ' + t.text); };

  const fieldState = error ? 'is-error' : draft.trim() ? 'is-filled' : 'is-empty';
  const blanks = Math.max(0, 3 - shown.length - (error ? 1 : 0));
  return (
    <section className={'card todos' + (editing && focused ? ' active' : '') + (editing && error ? ' has-error' : '')} aria-labelledby="todo-h">
      <Rings />
      <div className="card-head">
        <h2 id="todo-h">To-dos</h2>
        <div className="progress" aria-label={done + ' of ' + todos.length + ' done'}>
          <span className="progress-label">{done}/{todos.length} done</span>
          <span className="progress-track" aria-hidden="true"><span style={{ width: pct + '%' }} /></span>
        </div>
      </div>
      <ul className="ruled">
        {shown.map((t) => (
          <li key={t.id} className={'item' + (t.done ? ' done' : '') + (justAdded === t.id ? ' new' : '')}>
            <span className="gutter">
              <button type="button" className="tick" aria-pressed={t.done} aria-label={(t.done ? 'Mark not done: ' : 'Mark done: ') + t.text} onClick={() => toggle(t)}>
                <span className="circle">{t.done && <Icon icon={Tick02Icon} size={13} bold />}</span>
              </button>
            </span>
            <span className="text">{t.text}</span>
            <button type="button" className="x" aria-label={'Remove ' + t.text} onClick={() => remove(t)}>
              <Icon icon={Cancel01Icon} size={16} />
            </button>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="note"><span className="gutter" /><span className="text">{q ? 'No to-dos match \u201c' + query.trim() + '\u201d' : 'Nothing here yet. Add your first to-do.'}</span></li>
        )}

        {!editing ? (
          <li className="adder idle">
            <span className="gutter"><Icon icon={PlusSignIcon} size={18} /></span>
            <button type="button" className="adder-open" onClick={() => setEditing(true)}>Add a to-do</button>
          </li>
        ) : (
          <li className={'adder editing ' + fieldState}>
            <span className="gutter"><span className="circle ghost" /></span>
            <div className="entry" key={shake} data-shake={shake > 0 || undefined}>
              <label className="sr-only" htmlFor="new-todo">New to-do</label>
              <input id="new-todo" ref={inputRef} type="text" placeholder="What needs doing?" value={draft} maxLength={TODO_MAX}
                aria-invalid={!!error} aria-describedby={error ? 'todo-error' : undefined}
                onChange={(e) => { setDraft(e.target.value); if (error) setError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') close(); }}
                onFocus={() => setFocused(true)}
                onBlur={() => { setFocused(false); if (!draft.trim()) close(); }} />
              {focused && (
                <>
                  {draft.length > TODO_MAX - 20 && <span className="counter">{draft.length}/{TODO_MAX}</span>}
                  {fieldState !== 'is-filled' && <span className="hint" aria-hidden="true"><kbd>esc</kbd></span>}
                  <button type="button" className="add-pill" disabled={!draft.trim()} onMouseDown={(e) => e.preventDefault()} onClick={add}>
                    Add<kbd aria-hidden="true">↵</kbd>
                  </button>
                </>
              )}
            </div>
          </li>
        )}
        {editing && error && (
          <li className="helper" id="todo-error" role="alert"><span className="gutter" /><span className="text"><Icon icon={AlertCircleIcon} size={16} />{error}</span></li>
        )}
        {Array.from({ length: blanks }, (_, i) => <li key={'b' + i} className="blank" aria-hidden="true"><span className="gutter" /></li>)}
      </ul>
      <p className="sr-only" aria-live="polite">{announce}</p>
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
  const [copied, copy] = useCopy();
  const d = fromKey(LIVE_SESSION.date);
  const isLive = LIVE_SESSION.live;
  const upcoming = Object.keys(SESSIONS).sort().filter((k) => k >= todayKey && k !== LIVE_SESSION.date).slice(0, 4);
  return (
    <aside className="panel" aria-labelledby="session-h">
      <div className="panel-top">
        <div className="datechip" aria-label={d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}>
          <span className="m">{MONTHS[d.getMonth()].slice(0, 3).toUpperCase()}</span>
          <span className="d">{d.getDate()}</span>
        </div>
        <a className="join" href={MEET_LINK} target="_blank" rel="noreferrer"><Icon icon={UserAdd01Icon} size={18} bold />Join In</a>
      </div>
      <div className="session">
        <p className="eyebrow">{isLive ? "Today\u2019s session" : 'Next session'}</p>
        <h2 id="session-h">{LIVE_SESSION.title}</h2>
        {isLive
          ? <div className="live-now"><Icon icon={Video01Icon} size={18} bold />Live Now</div>
          : <div className="upcoming-when">{longDate(LIVE_SESSION.date)}</div>}
        <div className="meet">
          <span className="logo-tile"><img src="/icons/google-meet.webp" width="30" height="25" alt="" /></span>
          <div className="txt">
            <div className="t1">Google Meet Session</div>
            <div className="t2">Online Event</div>
          </div>
          <button type="button" className="copy" onClick={() => copy(MEET_LINK)}><Icon icon={copied ? Tick02Icon : Link04Icon} size={16} />{copied ? 'Copied' : 'Copy link'}</button>
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
              <Icon icon={ArrowRight01Icon} size={16} className="go" />
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

/* ---------- Modals ---------- */
function Row({ icon, label, children }) {
  return (
    <li>
      <span className="row-icon"><Icon icon={icon} size={18} /></span>
      <span className="row-label">{label}</span>
      <span className="row-value">{children}</span>
    </li>
  );
}

function ResourceModal({ item, onClose }) {
  const [copied, copy] = useCopy();
  const link = item.href && item.href !== '#' ? item.href : location.origin + '/#' + encodeURIComponent(item.name);
  return (
    <Modal title={item.name} onClose={onClose} footer={<>
      <button type="button" className="btn ghost" onClick={() => copy(link)}><Icon icon={copied ? Tick02Icon : Link04Icon} size={18} />{copied ? 'Copied' : 'Copy link'}</button>
      <span className="spacer" />
      <button type="button" className="glass btn" onClick={onClose}>Close</button>
      <a className="btn primary" href={item.href} target="_blank" rel="noreferrer">Open<Icon icon={ArrowUpRight01Icon} size={18} bold /></a>
    </>}>
      <div className="stage"><FileArt icon={item.icon} /></div>
      <div className="m-head">
        <span className="kind-icon"><Icon icon={KIND_ICONS[item.icon] || FileZipIcon} size={22} /></span>
        <div>
          <h3>{item.name}</h3>
          <p>Shared in DesignTales</p>
        </div>
      </div>
      <ul className="rows">
        <Row icon={KIND_ICONS[item.icon] || FileZipIcon} label="Kind">{item.kind}</Row>
        <Row icon={Clock01Icon} label="Added">{item.when}</Row>
        <Row icon={UserMultiple02Icon} label="Shared with">Everyone in the cohort</Row>
      </ul>
    </Modal>
  );
}

function DayModal({ dayKey, onClose, onOpenDay }) {
  const [copied, copy] = useCopy();
  const s = SESSIONS[dayKey];
  const d = fromKey(dayKey);
  const next = Object.keys(SESSIONS).sort().find((k) => k > dayKey);
  if (!s) {
    return (
      <Modal title={longDate(dayKey)} onClose={onClose} footer={<>
        <span className="spacer" />
        <button type="button" className="glass btn" onClick={onClose}>Close</button>
        {next && <button type="button" className="btn primary" onClick={() => onOpenDay(next)}>Next session<Icon icon={ArrowRight01Icon} size={18} bold /></button>}
      </>}>
        <div className="empty-state">
          <span className="empty-icon"><Icon icon={Calendar03Icon} size={32} /></span>
          <h3>No session on this day</h3>
          <p>{next ? <>Next up is <strong>{SESSIONS[next].title}</strong> on {fromKey(next).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</> : 'There are no more sessions scheduled.'}</p>
        </div>
      </Modal>
    );
  }
  return (
    <Modal title={s.title} onClose={onClose} footer={<>
      <button type="button" className="btn ghost" onClick={() => downloadIcs(dayKey, s)}><Icon icon={CalendarAdd01Icon} size={18} />Add to calendar</button>
      <span className="spacer" />
      <button type="button" className="glass btn" onClick={onClose}>Close</button>
      <a className="btn primary" href={MEET_LINK} target="_blank" rel="noreferrer"><Icon icon={Video01Icon} size={18} bold />Join on Meet</a>
    </>}>
      <div className="m-event">
        <div className="datechip lg" aria-hidden="true">
          <span className="m">{MONTHS[d.getMonth()].slice(0, 3).toUpperCase()}</span>
          <span className="d">{d.getDate()}</span>
        </div>
        <div>
          <p className="eyebrow">{d.toLocaleDateString('en-US', { weekday: 'long' })}</p>
          <h3>{s.title}</h3>
          <div className="session-tags">{s.tags.map((t) => <span key={t.label} className="tag" style={{ background: t.color }}>{t.label}</span>)}</div>
        </div>
      </div>
      <ul className="rows">
        <Row icon={Calendar03Icon} label="Date">{longDate(dayKey)}</Row>
        <Row icon={Clock01Icon} label="Time">{s.time}</Row>
        <Row icon={Video01Icon} label="Where">
          <span className="inline-copy">Google Meet
            <button type="button" className="mini" onClick={() => copy(MEET_LINK)}><Icon icon={copied ? Tick02Icon : Link04Icon} size={14} />{copied ? 'Copied' : 'Copy link'}</button>
          </span>
        </Row>
        <Row icon={Mortarboard01Icon} label="Cohort">DesignTales</Row>
      </ul>
    </Modal>
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
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) { e.preventDefault(); document.getElementById('search')?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

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
              <Icon icon={NAV_ICONS[k]} size={20} bold={view === k} /><span>{label}</span>
              {count !== undefined && <span className="count mono">{count}</span>}
            </button>
          ))}
        </div>

        <section className="layout" aria-labelledby="layout-h">
          <div className="layout-head">
            <h2 id="layout-h">Page Layout</h2>
            <button type="button" className="collapse" aria-expanded={layoutOpen} aria-label={layoutOpen ? 'Collapse page layout' : 'Expand page layout'} onClick={() => setLayoutOpen(!layoutOpen)}>
              <Icon icon={layoutOpen ? MinusSignSquareIcon : PlusSignSquareIcon} size={20} />
            </button>
          </div>
          {layoutOpen && (
            <ul>
              {layoutItems.map(([k, label]) => (
                <li key={k}>
                  <label className={show[k] ? '' : 'off'}>
                    <input type="checkbox" checked={show[k]} onChange={() => setShow({ ...show, [k]: !show[k] })} />
                    <span className={'check' + (show[k] ? ' on' : '')}>{show[k] && <Icon icon={Tick02Icon} size={14} bold />}</span>
                    {label}
                  </label>
                  <span className="grip"><Icon icon={DragDropVerticalIcon} size={20} /></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </nav>

      <main className="main">
        <div className="toolbar">
          <button type="button" className="glass back" aria-label="Back" disabled={nav.pos === 0} onClick={() => setNav((n) => ({ ...n, pos: Math.max(0, n.pos - 1) }))}><Icon icon={ArrowLeft01Icon} size={20} /></button>
          <div className={'search' + (query ? ' filled' : '')}>
            <Icon icon={Search01Icon} size={18} />
            <label className="sr-only" htmlFor="search">Search</label>
            <input id="search" type="search" placeholder="Search anything here" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }} />
            {query
              ? <button type="button" className="clear" aria-label="Clear search" onClick={() => setQuery('')}><Icon icon={Cancel01Icon} size={16} /></button>
              : <kbd className="hint" aria-hidden="true">/</kbd>}
          </div>
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

      {modal?.type === 'resource' && <ResourceModal item={modal.item} onClose={closeModal} />}
      {modal?.type === 'day' && <DayModal dayKey={modal.key} onClose={closeModal} onOpenDay={openDay} />}
    </div>
  );
}
