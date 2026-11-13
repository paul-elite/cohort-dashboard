import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon, ArrowRight01Icon, ArrowUpRight01Icon, Book02Icon, Calendar03Icon, CalendarAdd01Icon,
  Cancel01Icon, CheckmarkCircle02Icon, Clock01Icon, DashboardSquare01Icon, DragDropVerticalIcon, FileAudioIcon,
  FileVideoIcon, FileZipIcon, Folder01Icon, GridViewIcon, Link04Icon, ListViewIcon, MinusSignSquareIcon, Mortarboard01Icon,
  PlusSignIcon, AlertCircleIcon, SparklesIcon, PlusSignSquareIcon, Search01Icon, Sun03Icon, TextFontIcon, Tick02Icon,
  UserAdd01Icon, UserMultiple02Icon,
  Video01Icon, Wrench01Icon, Delete02Icon, ArrowTurnBackwardIcon, InformationCircleIcon, PartyIcon,
} from '@hugeicons/core-free-icons';
import { BRAND, COHORT, MEET_LINK, LIVE_SESSION, SESSIONS, RESOURCES, DEFAULT_TODOS, TOOLS, SESSION_PAGES } from './data.js';
import SessionPage from './SessionPage.jsx';
import ElementsPage from './ElementsPage.jsx';
import TypeAnatomy, { ANATOMY } from './TypeAnatomy.jsx';
import InputPlayground from './InputPlayground.jsx';
import { LeftRail, TopBar, SearchOverlay, Inspector, Facts, CardMenu, Block } from './Workspace.jsx';
import FileManager from './FileManager.jsx';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const VIEWS = { overview: 'Overview', calendar: 'Calendar', resources: 'Resources', todos: 'To-dos', tools: 'Tools', elements: 'UI elements', anatomy: 'Type anatomy', inputs: 'Input playground' };
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k) => new Date(k + 'T12:00:00');
const longDate = (k) => fromKey(k).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

// Resource icons (supplied SVGs, all 59 × 82).
const ICONS = {
  recording: { src: '/icons/recording.svg', w: 59, h: 82 },
  font: { src: '/icons/font.svg', w: 59, h: 82 },
  audio: { src: '/icons/audio.svg', w: 59, h: 82 },
  zip: { src: '/icons/zip.svg', w: 59, h: 82 },
  book: { src: '/icons/book.svg', w: 59, h: 82 },
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
const NAV_ICONS = { overview: DashboardSquare01Icon, calendar: Calendar03Icon, resources: Folder01Icon, todos: CheckmarkCircle02Icon, tools: Wrench01Icon, elements: GridViewIcon };
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

/* ---------- Toasts ----------
   toast({ tone, icon, title, desc, action: { label, onClick | href }, duration }) */
const ToastCtx = createContext(() => {});
const useToast = () => useContext(ToastCtx);

function ToastItem({ t, onDismiss }) {
  const timer = useRef(null);
  const start = () => { if (t.duration !== Infinity) timer.current = setTimeout(() => onDismiss(t.id), t.duration || 4000); };
  const stop = () => clearTimeout(timer.current);
  useEffect(() => { start(); return stop; }, []);
  const act = t.action;
  return (
    <li className={'toast tone-' + (t.tone || 'info')} onMouseEnter={stop} onMouseLeave={start} onFocus={stop} onBlur={start}>
      <span className="toast-icon"><Icon icon={t.icon || InformationCircleIcon} size={18} bold /></span>
      <div className="toast-text">
        <p className="toast-title">{t.title}</p>
        {t.desc && <p className="toast-desc">{t.desc}</p>}
      </div>
      {act && (act.href
        ? <a className="toast-action" href={act.href} target="_blank" rel="noreferrer" onClick={() => onDismiss(t.id)}>{act.label}</a>
        : <button type="button" className="toast-action" onClick={() => { act.onClick(); onDismiss(t.id); }}>{act.label}</button>)}
      {t.secondary && <button type="button" className="toast-action quiet" onClick={() => { t.secondary.onClick(); onDismiss(t.id); }}>{t.secondary.label}</button>}
      <button type="button" className="toast-close" aria-label="Dismiss" onClick={() => onDismiss(t.id)}><Icon icon={Cancel01Icon} size={14} /></button>
    </li>
  );
}

function Toaster({ toasts, onDismiss }) {
  return (
    <ol className="toaster" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => <ToastItem key={t.id} t={t} onDismiss={onDismiss} />)}
    </ol>
  );
}

function useCopy() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const copy = (text, what = 'Link') => {
    try { navigator.clipboard.writeText(text); } catch (e) { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    toast({ tone: 'info', icon: Link04Icon, title: what + ' copied', desc: 'Paste it anywhere to share.' });
  };
  return [copied, copy];
}

/* ---------- Sections ---------- */
function Rings({ n = 14 }) {
  return <div className="rings" aria-hidden="true">{Array.from({ length: n }, (_, i) => <span key={i} />)}</div>;
}

function AgendaRow({ k, todayKey, selected, onOpen }) {
  const s = SESSIONS[k];
  const d = fromKey(k);
  const isToday = k === todayKey;
  return (
    <li>
      <button type="button" className={'ag' + (selected ? ' selected' : '') + (isToday ? ' today' : '')} onClick={() => onOpen(k)}>
        <span className="bar" style={{ background: s.tags[0].color }} aria-hidden="true" />
        <span className="ag-date"><b>{d.getDate()}</b>{d.toLocaleDateString('en-US', { month: 'short' })}</span>
        <span className="ag-text">
          <span className="ag-title">{s.title}</span>
          <span className="ag-meta">{isToday ? 'Today' : DOW[d.getDay()].charAt(0) + DOW[d.getDay()].slice(1).toLowerCase()} · {s.time}</span>
        </span>
        {isToday && LIVE_SESSION.live && LIVE_SESSION.date === k && <span className="pulse" aria-label="Live now" />}
      </button>
    </li>
  );
}

const DOW1 = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const shortDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const startOfWeek = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());

function Calendar({ big, todayKey, onOpenDay, selectedKey }) {
  const today = fromKey(todayKey);
  const [mode, setMode] = useState(() => load('cohort-cal-view', 'week'));
  useEffect(() => save('cohort-cal-view', mode), [mode]);
  // anchor: any date inside the visible week or month
  const [anchor, setAnchor] = useState(today);

  const days = useMemo(() => {
    if (mode === 'week') {
      const s = startOfWeek(anchor);
      return Array.from({ length: 7 }, (_, i) => new Date(s.getFullYear(), s.getMonth(), s.getDate() + i));
    }
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const lead = first.getDay();
    const total = Math.ceil((lead + new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()) / 7) * 7;
    return Array.from({ length: total }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i - lead + 1));
  }, [mode, anchor]);

  const step = (n) => setAnchor((d) => mode === 'week'
    ? new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7 * n)
    : new Date(d.getFullYear(), d.getMonth() + n, 1));

  const inRange = (d) => mode === 'week' || d.getMonth() === anchor.getMonth();
  const listed = days.filter(inRange).map((d) => keyOf(d)).filter((k) => SESSIONS[k]);
  const title = mode === 'week'
    ? `${shortDate(days[0])} – ${days[0].getMonth() === days[6].getMonth() ? days[6].getDate() : shortDate(days[6])}`
    : MONTHS[anchor.getMonth()];
  const unit = mode === 'week' ? 'week' : 'month';
  const lastKey = keyOf(days[days.length - 1]);
  const later = mode === 'week' ? Object.keys(SESSIONS).sort().filter((k) => k > lastKey).slice(0, 3) : [];
  const away = mode === 'week' ? !days.some((d) => keyOf(d) === todayKey)
    : anchor.getMonth() !== today.getMonth() || anchor.getFullYear() !== today.getFullYear();

  return (
    <section className={'card cal ' + mode + (big ? ' big' : '')} aria-labelledby="cal-h">
      <div className="card-head">
        <h2 id="cal-h">{title} <span className="year">{anchor.getFullYear()}</span></h2>
        <div className="cal-tools">
          <div className="mode" role="tablist" aria-label="Calendar view">
            {['week', 'month'].map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>
                {m === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
          {away && <button type="button" className="today-link" onClick={() => setAnchor(today)}>Today</button>}
          <button type="button" className="ghost-ic" aria-label={'Previous ' + unit} onClick={() => step(-1)}><Icon icon={ArrowLeft01Icon} size={18} /></button>
          <button type="button" className="ghost-ic" aria-label={'Next ' + unit} onClick={() => step(1)}><Icon icon={ArrowRight01Icon} size={18} /></button>
        </div>
      </div>

      <div className="days" role="grid">
        {DOW1.map((d, i) => <div key={i} className="dow" aria-hidden="true">{mode === 'week' ? DOW[i].slice(0, 3) : d}</div>)}
        {days.map((d) => {
          const k = keyOf(d);
          const s = SESSIONS[k];
          const out = !inRange(d);
          return (
            <button type="button" key={k}
              className={'day' + (s ? ' has' : '') + (k === todayKey ? ' today' : '') + (selectedKey === k ? ' selected' : '') + (out ? ' out' : '')}
              aria-pressed={selectedKey === k}
              onClick={() => onOpenDay(k)}
              aria-label={longDate(k) + (k === todayKey ? ', today' : '') + (s ? ': ' + s.title : '')}>
              <span className="n">{d.getDate()}</span>
              <span className="dot" style={s && !out ? { background: s.tags[0].color } : undefined} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <ul className="agenda" aria-label={'Sessions this ' + unit}>
        {listed.length === 0 && <li className="none">No sessions this {unit}.</li>}
        {listed.map((k) => <AgendaRow key={k} k={k} todayKey={todayKey} selected={selectedKey === k} onOpen={onOpenDay} />)}
        {later.length > 0 && <li className="ag-head">Up next</li>}
        {later.map((k) => <AgendaRow key={k} k={k} todayKey={todayKey} selected={selectedKey === k} onOpen={onOpenDay} />)}
      </ul>
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
  const toast = useToast();
  const inputRef = useRef(null);
  useEffect(() => { if (editing) inputRef.current?.focus({ preventScroll: true }); }, [editing]);
  // Keep the paper on whole 48px lines: any leftover height moves under the header.
  const cardRef = useRef(null);
  const fillerRef = useRef(null);
  const spare = useRef(0);
  useEffect(() => {
    const el = fillerRef.current; if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const next = Math.round(el.getBoundingClientRect().height + spare.current) % 48;
      if (next !== spare.current) { spare.current = next; cardRef.current?.style.setProperty('--spare', next + 'px'); }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    setDraft(''); setError(''); setJustAdded(id);
    toast({ tone: 'success', icon: Tick02Icon, title: 'To-do added', desc: text });
    setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 1400);
    inputRef.current?.focus({ preventScroll: true });
  };
  const close = () => { setDraft(''); setError(''); setEditing(false); setFocused(false); };
  const toggle = (t) => {
    const flip = (list) => list.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x));
    setTodos(flip(todos));
    toast(t.done
      ? { tone: 'info', icon: ArrowTurnBackwardIcon, title: 'Moved back to your list', desc: t.text }
      : { tone: 'success', icon: PartyIcon, title: 'Nice, that\u2019s done', desc: t.text, action: { label: 'Undo', onClick: () => setTodos((cur) => cur.map((x) => (x.id === t.id ? { ...x, done: false } : x))) } });
  };
  const remove = (t) => {
    const index = todos.findIndex((x) => x.id === t.id);
    setTodos(todos.filter((x) => x.id !== t.id));
    toast({ tone: 'danger', icon: Delete02Icon, title: 'To-do removed', desc: t.text,
      action: { label: 'Undo', onClick: () => setTodos((cur) => { const next = cur.slice(); next.splice(Math.min(index, next.length), 0, t); return next; }) } });
  };

  const fieldState = error ? 'is-error' : draft.trim() ? 'is-filled' : 'is-empty';
  return (
    <section ref={cardRef} className={'card todos' + (editing && focused ? ' active' : '') + (editing && error ? ' has-error' : '')} aria-labelledby="todo-h">
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

        <li className="filler" ref={fillerRef} aria-hidden="true"><span className="gutter" /></li>
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
              {error && <span className="inline-error" id="todo-error" role="alert"><Icon icon={AlertCircleIcon} size={16} />{error}</span>}
              {focused && (
                <>
                  {draft.length > TODO_MAX - 20 && <span className="counter">{draft.length}/{TODO_MAX}</span>}
                  {fieldState === 'is-empty' && <span className="hint" aria-hidden="true"><kbd>esc</kbd></span>}
                  <button type="button" className="add-pill" disabled={!draft.trim()} onMouseDown={(e) => e.preventDefault()} onClick={add}>
                    Add<kbd aria-hidden="true">↵</kbd>
                  </button>
                </>
              )}
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}

function Tools({ menu }) {
  return (
    <section className="card tools" aria-labelledby="tools-h">
      <div className="card-head"><h2 id="tools-h">Bookmarked tools</h2>{menu}</div>
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

function SessionList({ title, exclude, onOpenDay }) {
  const keys = Object.keys(SESSIONS).sort().filter((k) => k !== exclude);
  if (!keys.length) return null;
  return (
    <div className="coming">
      <h3 className="eyebrow">{title}</h3>
      {keys.map((k) => (
        <button type="button" key={k} onClick={() => onOpenDay(k)}>
          <i style={{ background: SESSIONS[k].tags[0].color }} />
          <span className="l">{SESSIONS[k].title}</span>
          <span className="d mono">{fromKey(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <Icon icon={ArrowRight01Icon} size={16} className="go" />
        </button>
      ))}
    </div>
  );
}

/* ---------- Sessions in date order ---------- */
const sessionKeys = () => Object.keys(SESSIONS).sort();

/* ---------- Inspector content ---------- */
/* Day details: shown in the inspector when a calendar day or session is picked */
function DayDetails({ dayKey, onOpenDay, onOpenPage }) {
  const toast = useToast();
  const [copied, copy] = useCopy();
  const s = SESSIONS[dayKey];
  const d = fromKey(dayKey);
  const next = sessionKeys().find((k) => k > dayKey);
  const isLive = LIVE_SESSION.live && dayKey === LIVE_SESSION.date && dayKey === keyOf(new Date());
  const saveIcs = () => {
    downloadIcs(dayKey, s);
    toast({ tone: 'success', icon: CalendarAdd01Icon, title: 'Calendar file downloaded', desc: 'Open it to add “' + s.title + '” to your calendar.' });
  };
  if (!s) {
    return (
      <div className="ws-detail" key={dayKey}>
        <p className="ws-note">
          No session on {d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
          {next ? <> Next up is <strong>{SESSIONS[next].title}</strong> on {fromKey(next).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.</> : ' There are no more sessions scheduled.'}
        </p>
        {next && <div className="ws-actions"><button type="button" className="ws-btn primary" onClick={() => onOpenDay(next)}>See next session</button></div>}
      </div>
    );
  }
  return (
    <div className="ws-detail" key={dayKey}>
      <Facts rows={[
        ['Session', s.title],
        ['Date', d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })],
        ['Time', s.time],
        ['Topics', s.tags.map((t) => t.label).join(', ')],
        ['Status', isLive ? <span className="ws-live"><span className="pulse" aria-hidden="true" />Live now</span> : dayKey < keyOf(new Date()) ? 'Done' : 'Upcoming'],
      ]} />
      <div className="ws-actions">
        <button type="button" className="ws-btn" onClick={saveIcs} title="Download a calendar file">Save date</button>
        <a className="ws-btn primary" href={MEET_LINK} target="_blank" rel="noreferrer">Join Meet</a>
      </div>
      <div className="ws-sublinks">
        <button type="button" className="ws-sublink" onClick={() => copy(MEET_LINK, 'Meet link')}>{copied ? 'Meet link copied' : 'Copy Meet link'}</button>
        {onOpenPage && <button type="button" className="ws-sublink" onClick={onOpenPage}>Read the session page</button>}
      </div>
    </div>
  );
}

/* Resource details: shown in the inspector when a file is picked */
function ResourceDetails({ item }) {
  const [copied, copy] = useCopy();
  const link = item.href && item.href !== '#' ? item.href : location.origin + '/#' + encodeURIComponent(item.name);
  const ext = { recording: 'mp4', font: 'zip', audio: 'wav', zip: 'zip', book: 'pdf' }[item.icon] || 'zip';
  return (
    <div className="ws-detail" key={item.name}>
      <Facts rows={[
        ['File', item.name.replace(/\s+/g, '') + '.' + ext],
        ['Type', item.kind],
        ['Updated', item.when],
        ['Shared', 'Whole cohort'],
      ]} />
      <div className="ws-actions">
        <button type="button" className="ws-btn" onClick={() => copy(link)}>{copied ? 'Copied' : 'Copy link'}</button>
        <a className="ws-btn primary" href={item.href} target="_blank" rel="noreferrer">Open</a>
      </div>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const todayKey = keyOf(new Date());
  const [nav, setNav] = useState({ history: ['overview'], pos: 0 });
  const [anatomyTerm, setAnatomyTerm] = useState(ANATOMY[0]);
  const [todos, setTodos] = useState(() => load('cohort-todos', DEFAULT_TODOS));
  const [panel, setPanel] = useState(null); // null | { type: 'resource', item } | { type: 'day', key }
  const [searchOpen, setSearchOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((cur) => cur.filter((t) => t.id !== id)), []);
  const toast = useCallback((t) => setToasts((cur) => [...cur.slice(-2), { id: Date.now() + Math.random(), ...t }]), []);

  const [opened, setOpened] = useState(() => load('cohort-opened', []));
  useEffect(() => save('cohort-opened', opened), [opened]);
  useEffect(() => save('cohort-todos', todos), [todos]);
  useEffect(() => {
    const onKey = (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
      if (!typing && (e.key === '/' || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)))) { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape' && !typing) { setPanel(null); setRailOpen(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const view = nav.history[nav.pos];
  const isSession = view.startsWith('session:');
  const sessionKey = isSession ? view.slice('session:'.length) : null;
  useEffect(() => {
    const name = isSession ? SESSIONS[sessionKey]?.title : VIEWS[view];
    document.title = `${name || 'Overview'} · Cohort | ${BRAND}`;
  }, [view, isSession, sessionKey]);

  const toTop = () => requestAnimationFrame(() => {
    document.querySelector('.ws-center')?.scrollTo?.({ top: 0 });
    window.scrollTo?.({ top: 0 });
  });
  const go = (v) => {
    setNav(({ history, pos }) => {
      if (history[pos] === v) return { history, pos };
      const h = history.slice(0, pos + 1).concat(v);
      return { history: h, pos: h.length - 1 };
    });
    toTop();
  };
  const back = () => { setNav((n) => ({ ...n, pos: Math.max(0, n.pos - 1) })); toTop(); };
  // The overview (homepage) holds only Resources and To-dos; the other cards live on their own pages.
  const ON_OVERVIEW = ['resources', 'todos'];
  const visible = (k) => (view === 'overview' ? ON_OVERVIEW.includes(k) : view === k);
  const openDay = (key) => setPanel((cur) => (cur?.type === 'day' && cur.key === key ? null : { type: 'day', key }));
  const showDay = (key) => setPanel({ type: 'day', key });
  const openSession = (key) => {
    if (!SESSION_PAGES[key]) { showDay(key); return; }
    setPanel(null);
    go('session:' + key);
  };
  const markOpened = (item) => setOpened((cur) => (cur.includes(item.name) ? cur : [...cur, item.name]));
  const showResource = (item) => { markOpened(item); setPanel({ type: 'resource', item }); };

  const [recents, setRecents] = useState(() => load('cohort-recents', []));
  useEffect(() => save('cohort-recents', recents), [recents]);
  const remember = useCallback((id) => setRecents((cur) => [id, ...cur.filter((x) => x !== id)].slice(0, 12)), []);
  useEffect(() => { if (view !== 'overview') remember(view.startsWith('session:') ? view : 'view:' + view); }, [view, remember]);
  useEffect(() => {
    if (panel?.type === 'resource') remember('res:' + panel.item.name);
    if (panel?.type === 'day' && SESSIONS[panel.key]) remember('day:' + panel.key);
  }, [panel, remember]);

  // Live session announcement, once per browser session
  useEffect(() => {
    if (!LIVE_SESSION.live || LIVE_SESSION.date !== todayKey) return;
    try { if (sessionStorage.getItem('live-toast')) return; sessionStorage.setItem('live-toast', '1'); } catch (e) { /* storage unavailable */ }
    const t = setTimeout(() => toast({
      tone: 'live', icon: Video01Icon, duration: Infinity,
      title: LIVE_SESSION.title + ' is live', desc: 'Today · Google Meet',
      action: { label: 'Join', href: MEET_LINK }, secondary: { label: 'Details', onClick: () => showDay(LIVE_SESSION.date) },
    }), 600);
    return () => clearTimeout(t);
  }, []);

  const shortD = (k) => fromKey(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  /* Left rail: a basic menu, then recents. */
  const MENU = [['overview', 'Overview'], ['calendar', 'Calendar'], ['resources', 'Resources'], ['todos', 'To-dos'], ['tools', 'Tools'],
    ['elements', 'UI elements'], ['anatomy', 'Type anatomy'], ['inputs', 'Input playground']];
  const recentItems = recents.map((id) => {
    const i = id.indexOf(':'); const kind = id.slice(0, i); const key = id.slice(i + 1);
    if (kind === 'view' && VIEWS[key]) return { key: id, label: VIEWS[key], count: 'Page', current: view === key, onClick: () => { setPanel(null); go(key); } };
    if (kind === 'session' && SESSIONS[key] && SESSION_PAGES[key]) return { key: id, label: SESSIONS[key].title, count: 'Session', current: view === id, onClick: () => openSession(key) };
    if (kind === 'day' && SESSIONS[key]) return { key: id, label: SESSIONS[key].title, count: shortD(key), current: panel?.type === 'day' && panel.key === key, onClick: () => showDay(key) };
    if (kind === 'res') {
      const r = RESOURCES.find((x) => x.name === key);
      if (r) return { key: id, label: r.name, count: 'File', current: panel?.type === 'resource' && panel.item.name === key, onClick: () => showResource(r) };
    }
    return null;
  }).filter(Boolean).slice(0, 6);
  const groups = [
    { label: 'Menu', items: MENU.map(([k, label]) => ({ key: k, label, current: view === k, onClick: () => { setPanel(null); go(k); } })) },
    { label: 'Recents', showLabel: true, items: recentItems, empty: 'Pages, sessions and files you open show up here.' },
  ];

  const rightMeta = [
    { icon: 'type', text: `${COHORT.name} #${COHORT.number}` },
    { icon: 'clock', text: fromKey(todayKey).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
  ];

  const crumbs = isSession
    ? [{ label: 'Sessions', onClick: () => go('overview') }, { label: SESSIONS[sessionKey]?.title }]
    : view === 'overview' ? []
      : [{ label: COHORT.name, onClick: () => go('overview') }, { label: VIEWS[view] }];

  const menuFor = (k) => (view === k ? null : (
    <CardMenu label={VIEWS[k] + ' options'} items={[{ label: 'Open ' + VIEWS[k], onClick: () => go(k) }]} />
  ));

  const searchIndex = useMemo(() => [
    ...Object.entries(VIEWS).map(([k, label]) => ({ id: 'view:' + k, group: 'Pages', label, onPick: () => go(k) })),
    ...sessionKeys().map((k) => ({ id: 'session:' + k, group: 'Sessions', label: SESSIONS[k].title, hint: shortD(k),
      keywords: SESSIONS[k].tags.map((t) => t.label).join(' '), onPick: () => openSession(k) })),
    ...RESOURCES.map((r) => ({ id: 'res:' + r.name, group: 'Resources', label: r.name, hint: r.kind,
      onPick: () => { go('resources'); showResource(r); } })),
    ...todos.map((t) => ({ id: 'todo:' + t.id, group: 'To-dos', label: t.text, hint: t.done ? 'Done' : 'Open', onPick: () => go('todos') })),
    ...TOOLS.map((t) => ({ id: 'tool:' + t.name, group: 'Tools', label: t.name, hint: 'Opens in a new tab', onPick: () => window.open(t.href, '_blank', 'noreferrer') })),
  ], [todos]);

  const blocks = [
    ['calendar', <Calendar big={view === 'calendar'} todayKey={todayKey} onOpenDay={openDay} selectedKey={panel?.type === 'day' ? panel.key : null} />],
    ['resources', <FileManager files={RESOURCES} selected={panel?.type === 'resource' ? panel.item.name : null} onSelect={showResource} compact={view === 'overview'} flat={view === 'resources'} />],
    ['todos', <Todos todos={todos} setTodos={setTodos} query="" />],
    ['tools', <Tools menu={menuFor('tools')} />],
  ];

  const inspectorOpen = !!panel;
  return (
    <ToastCtx.Provider value={toast}>
    <div className={'ws-app' + (['elements', 'anatomy', 'inputs', 'resources'].includes(view) ? ' is-wide' : '')}>
      <LeftRail groups={groups} open={railOpen} onClose={() => setRailOpen(false)} />

      <main className="ws-center main">
        <TopBar canBack={nav.pos > 0 && view !== 'overview'} onBack={back} crumbs={crumbs} onSearch={() => setSearchOpen(true)} onMenu={() => setRailOpen(true)} />
        <div className="ws-col">
          {isSession && SESSION_PAGES[sessionKey] && (
            <SessionPage dayKey={sessionKey} onOpenDay={showDay} onOpenSession={openSession} onBack={() => go('overview')} />
          )}
          {view === 'elements' && <ElementsPage />}
          {view === 'anatomy' && <Block id="blk-anatomy" title="Type anatomy" desc="The named parts of a letter, measured from the live font. Pick a term to see it drawn." wide><TypeAnatomy query="" selected={anatomyTerm} onSelect={setAnatomyTerm} /></Block>}
          {view === 'inputs' && <Block id="blk-inputs" title="Input playground" desc="Every input in one place. Change the settings and the preview updates." wide><InputPlayground query="" /></Block>}
          {/* Tools and the lobby are apps, not articles: their panels sit straight in the column. */}
          {!isSession && !['elements', 'anatomy', 'inputs'].includes(view) && blocks.filter(([k]) => visible(k)).map(([k, node]) => (
            <div key={k} className="ws-app-panel" id={'blk-' + k}>{node}</div>
          ))}
        </div>
      </main>

      <Inspector open={inspectorOpen} onClose={() => setPanel(null)} meta={rightMeta}
        label={panel?.type === 'resource' ? 'Resource details' : panel?.type === 'day' ? 'Session details' : 'Details'}>
        {panel?.type === 'resource' && <ResourceDetails item={panel.item} />}
        {panel?.type === 'day' && (
          <DayDetails dayKey={panel.key} onOpenDay={showDay}
            onOpenPage={SESSION_PAGES[panel.key] && view !== 'session:' + panel.key ? () => openSession(panel.key) : null} />
        )}
      </Inspector>

      {(railOpen || inspectorOpen) && (
        <div className={'ws-scrim' + (railOpen ? ' for-left' : ' for-right')} aria-hidden="true"
          onClick={() => { setRailOpen(false); setPanel(null); }} />
      )}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} index={searchIndex} onPick={(it) => it.onPick()} />
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
    </ToastCtx.Provider>
  );
}
