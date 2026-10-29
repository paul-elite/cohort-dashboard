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
import CoverArt from './CoverArt.jsx';
import SessionPage from './SessionPage.jsx';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const VIEWS = { overview: 'Overview', calendar: 'Calendar', resources: 'Resources', todos: 'To-dos', tools: 'Tools' };
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
      <Rings />
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

function FileArt({ icon }) {
  const i = ICONS[icon] || ICONS.zip;
  return <img src={i.src} width={i.w} height={i.h} alt="" />;
}

function Resources({ query, onOpen, selected }) {
  const q = query.trim().toLowerCase();
  const items = RESOURCES.filter((r) => !q || r.name.toLowerCase().includes(q));
  return (
    <section className="card res" aria-labelledby="res-h">
      <div className="card-head"><h2 id="res-h">Resources</h2></div>
      <div className="files">
        {items.map((f) => (
          <button type="button" key={f.name} className={'file' + (selected === f.name ? ' selected' : '')} aria-pressed={selected === f.name} onClick={() => onOpen(f)} aria-label={`${f.name}, ${f.when}`}>
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

function EmptyPanel() {
  // Desktop keeps the details column on screen even when nothing is selected.
  // It stays blank so the layout does not move when a panel opens.
  return <aside className="panel empty-panel" aria-hidden="true" />;
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

/* ---------- Home: the cohort archive, one card per session (overview only) ---------- */
const SESSION_KEYS = Object.keys(SESSIONS).sort();
const sessionNo = (k) => SESSION_KEYS.indexOf(k) + 1;

/* Cover art per session, in chronological order. */
const COVERS = ['type', 'color', 'screen', 'wire', 'motion', 'demo'];

function Home({ todayKey, onOpenSession }) {
  const done = SESSION_KEYS.filter((k) => k < todayKey);
  const last = done[done.length - 1];
  const next = SESSION_KEYS.find((k) => k >= todayKey);
  const [mode, setMode] = useState(() => load('cohort-home-view', 'grid'));
  const [filter, setFilter] = useState('all');
  useEffect(() => save('cohort-home-view', mode), [mode]);

  const keys = [...SESSION_KEYS].reverse().filter((k) => (
    filter === 'all' ? true : filter === 'done' ? k < todayKey : k >= todayKey
  ));

  return (
    <section className="sessions" aria-labelledby="sessions-h">
      <header className="sessions-head">
        <div>
          <h1 id="sessions-h">Sessions</h1>
          <p>{done.length} of {SESSION_KEYS.length} complete · {COHORT.name} Cohort #{COHORT.number}</p>
        </div>
        <span className="count-pill" aria-label={SESSION_KEYS.length + ' sessions'}>{SESSION_KEYS.length}</span>
      </header>

      <div className="sessions-bar">
        <div className="sess-seg" role="group" aria-label="Filter sessions">
          {[['all', 'All'], ['done', 'Done'], ['upcoming', 'Upcoming']].map(([k, label]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{label}</button>
          ))}
        </div>
        <div className="sess-seg view" role="group" aria-label="Session layout">
          <button type="button" aria-pressed={mode === 'grid'} aria-label="Grid view" onClick={() => setMode('grid')}><Icon icon={GridViewIcon} size={16} /></button>
          <button type="button" aria-pressed={mode === 'list'} aria-label="List view" onClick={() => setMode('list')}><Icon icon={ListViewIcon} size={16} /></button>
        </div>
      </div>

      <ul className={'session-grid ' + mode}>
        {keys.map((k) => {
          const s = SESSIONS[k];
          const badge = k === next
            ? ['Next', 'next', SparklesIcon]
            : k === last ? ['New', 'new', SparklesIcon] : null;
          return (
            <li key={k}>
              <button type="button" className="session-card" onClick={() => onOpenSession(k)}>
                <span className="list-no" aria-hidden="true">{pad(sessionNo(k))}</span>
                <span className="sess-cover">
                  <span className="sess-top">
                    {badge
                      ? <span className={'sess-badge ' + badge[1]}><Icon icon={badge[2]} size={13} bold />{badge[0]}</span>
                      : <span />}
                    <span className="sess-issue">Session {pad(sessionNo(k))}</span>
                  </span>
                  <span className="sess-body"><CoverArt kind={COVERS[SESSION_KEYS.indexOf(k) % COVERS.length]} /></span>
                  <span className="sess-tags">
                    {s.tags.map((t) => <span key={t.label} className="sess-tag"><i style={{ background: t.color }} />{t.label}</span>)}
                  </span>
                </span>
                <span className="session-lines">
                  <span className="session-name">{s.title}</span>
                  <span className="session-sub">{fromKey(k).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} · {s.time}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {keys.length === 0 && <p className="sessions-empty">Nothing here yet.</p>}
    </section>
  );
}

/* Day details: shown in the right-hand panel when a calendar day is clicked */
function DayPanel({ dayKey, onClose, onOpenDay, onOpenPage }) {
  const toast = useToast();
  const [copied, copy] = useCopy();
  const ref = useRef(null);
  const s = SESSIONS[dayKey];
  const d = fromKey(dayKey);
  const next = Object.keys(SESSIONS).sort().find((k) => k > dayKey);
  const isLive = LIVE_SESSION.live && dayKey === LIVE_SESSION.date && dayKey === keyOf(new Date());
  useEffect(() => {
    ref.current?.scrollTo?.({ top: 0 });
    if (window.innerWidth <= 1280) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [dayKey]);
  const saveIcs = () => {
    downloadIcs(dayKey, s);
    toast({ tone: 'success', icon: CalendarAdd01Icon, title: 'Calendar file downloaded', desc: 'Open it to add \u201c' + s.title + '\u201d to your calendar.' });
  };
  return (
    <aside className="panel detail" aria-labelledby="day-h" ref={ref} key={dayKey}>
      <div className="panel-top">
        <button type="button" className="glass back" aria-label="Close details" onClick={onClose}><Icon icon={Cancel01Icon} size={18} /></button>
        <span className="eyebrow">{s ? 'Session details' : 'Day details'}</span>
      </div>
      {s ? (
        <>
          <div className="m-event">
            <div className="datechip lg" aria-hidden="true">
              <span className="m">{MONTHS[d.getMonth()].slice(0, 3).toUpperCase()}</span>
              <span className="d">{d.getDate()}</span>
            </div>
            <div>
              <p className="eyebrow">{d.toLocaleDateString('en-US', { weekday: 'long' })}</p>
              <h2 id="day-h">{s.title}</h2>
              {isLive && <div className="live-now"><span className="pulse" aria-hidden="true" />Live now</div>}
              <div className="session-tags">{s.tags.map((t) => <span key={t.label} className="tag" style={{ background: t.color, color: t.ink }}>{t.label}</span>)}</div>
            </div>
          </div>
          <div className="meet">
            <span className="logo-tile"><img src="/icons/google-meet.webp" width="30" height="25" alt="" /></span>
            <div className="txt">
              <div className="t1">Google Meet Session</div>
              <div className="t2">Online event</div>
            </div>
            <button type="button" className="copy" onClick={() => copy(MEET_LINK, 'Meet link')}><Icon icon={copied ? Tick02Icon : Link04Icon} size={16} />{copied ? 'Copied' : 'Copy link'}</button>
          </div>
          <ul className="rows">
            <Row icon={Calendar03Icon} label="Date">{longDate(dayKey)}</Row>
            <Row icon={Clock01Icon} label="Time">{s.time}</Row>
            <Row icon={Mortarboard01Icon} label="Cohort">DesignTales</Row>
          </ul>
          <div className="detail-actions">
            <button type="button" className="glass btn" onClick={saveIcs}><Icon icon={CalendarAdd01Icon} size={18} />Add to calendar</button>
            <a className="btn primary" href={MEET_LINK} target="_blank" rel="noreferrer"><Icon icon={Video01Icon} size={18} bold />Join on Meet</a>
          </div>
          {onOpenPage && (
            <button type="button" className="detail-page" onClick={onOpenPage}>
              <span className="detail-page-art" aria-hidden="true">Aa</span>
              <span className="detail-page-text">
                <span className="eyebrow">Session page</span>
                <span>{SESSION_PAGES[dayKey]?.kicker}</span>
              </span>
              <Icon icon={ArrowRight01Icon} size={18} className="go" />
            </button>
          )}
        </>
      ) : (
        <div className="empty-state day-empty">
          <span className="empty-icon"><Icon icon={Calendar03Icon} size={28} /></span>
          <h2 id="day-h">No session on {d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
          <p>{next ? <>Next up is <strong>{SESSIONS[next].title}</strong> on {fromKey(next).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</> : 'There are no more sessions scheduled.'}</p>
          {next && <button type="button" className="btn primary" onClick={() => onOpenDay(next)}>See next session<Icon icon={ArrowRight01Icon} size={18} bold /></button>}
        </div>
      )}
      <SessionList title={s ? 'Other sessions' : 'All sessions'} exclude={dayKey} onOpenDay={onOpenDay} />
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

/* Resource details: shown in the right-hand panel when a resource icon is clicked */
function DetailPanel({ item, onClose, onSelect }) {
  const [copied, copy] = useCopy();
  const ref = useRef(null);
  const link = item.href && item.href !== '#' ? item.href : location.origin + '/#' + encodeURIComponent(item.name);
  const others = RESOURCES.filter((r) => r.name !== item.name);
  useEffect(() => {
    ref.current?.scrollTo?.({ top: 0 });
    if (window.innerWidth <= 1280) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [item]);
  return (
    <aside className="panel detail" aria-labelledby="detail-h" ref={ref} key={item.name}>
      <div className="panel-top">
        <button type="button" className="glass back" aria-label="Close details" onClick={onClose}><Icon icon={Cancel01Icon} size={18} /></button>
        <span className="eyebrow">Resource details</span>
      </div>
      <div className="detail-art"><FileArt icon={item.icon} /></div>
      <div className="m-head">
        <span className="kind-icon"><Icon icon={KIND_ICONS[item.icon] || FileZipIcon} size={22} /></span>
        <div>
          <h2 id="detail-h">{item.name}</h2>
          <p>Shared in DesignTales</p>
        </div>
      </div>
      <ul className="rows">
        <Row icon={KIND_ICONS[item.icon] || FileZipIcon} label="Kind">{item.kind}</Row>
        <Row icon={Clock01Icon} label="Added">{item.when}</Row>
        <Row icon={Mortarboard01Icon} label="Cohort">DesignTales</Row>
        <Row icon={UserMultiple02Icon} label="Shared with">Everyone in the cohort</Row>
      </ul>
      <div className="detail-actions">
        <button type="button" className="glass btn" onClick={() => copy(link)}><Icon icon={copied ? Tick02Icon : Link04Icon} size={18} />{copied ? 'Copied' : 'Copy link'}</button>
        <a className="btn primary" href={item.href} target="_blank" rel="noreferrer">Open<Icon icon={ArrowUpRight01Icon} size={18} bold /></a>
      </div>
      <div className="coming">
        <h3 className="eyebrow">More resources</h3>
        {others.map((r) => (
          <button type="button" key={r.name} onClick={() => onSelect(r)}>
            <span className="mini-kind"><Icon icon={KIND_ICONS[r.icon] || FileZipIcon} size={18} /></span>
            <span className="l">{r.name}</span>
            <span className="d">{r.when}</span>
            <Icon icon={ArrowRight01Icon} size={16} className="go" />
          </button>
        ))}
      </div>
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
  const [panel, setPanel] = useState(null); // null | { type: 'resource', item } | { type: 'day', key }
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((cur) => cur.filter((t) => t.id !== id)), []);
  const toast = useCallback((t) => setToasts((cur) => [...cur.slice(-2), { id: Date.now() + Math.random(), ...t }]), []);

  const [opened, setOpened] = useState(() => load('cohort-opened', []));
  useEffect(() => save('cohort-opened', opened), [opened]);
  useEffect(() => save('cohort-todos', todos), [todos]);
  useEffect(() => save('cohort-layout', show), [show]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) { e.preventDefault(); document.getElementById('search')?.focus(); }
      if (e.key === 'Escape' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) setPanel(null);
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

  const go = (v) => setNav(({ history, pos }) => {
    if (history[pos] === v) return { history, pos };
    const h = history.slice(0, pos + 1).concat(v);
    return { history: h, pos: h.length - 1 };
  });
  const visible = (k) => (view === 'overview' ? show[k] : view === k);
  const openDay = (key) => setPanel((cur) => (cur?.type === 'day' && cur.key === key ? null : { type: 'day', key }));
  const showDay = (key) => setPanel({ type: 'day', key });
  const openSession = (key) => {
    if (!SESSION_PAGES[key]) { showDay(key); return; }
    setPanel(null);
    go('session:' + key);
    requestAnimationFrame(() => {
      document.querySelector('.main')?.scrollTo?.({ top: 0 });
      document.querySelector('.app')?.scrollTo?.({ top: 0 });
      window.scrollTo?.({ top: 0 });
    });
  };
  const markOpened = (item) => setOpened((cur) => (cur.includes(item.name) ? cur : [...cur, item.name]));
  const openResource = (item) => {
    markOpened(item);
    setPanel((cur) => (cur?.type === 'resource' && cur.item.name === item.name ? null : { type: 'resource', item }));
  };
  const showResource = (item) => { markOpened(item); setPanel({ type: 'resource', item }); };

  // Live session announcement, once per browser session
  useEffect(() => {
    if (!LIVE_SESSION.live || LIVE_SESSION.date !== todayKey) return;
    try { if (sessionStorage.getItem('live-toast')) return; sessionStorage.setItem('live-toast', '1'); } catch (e) { /* storage unavailable */ }
    const t = setTimeout(() => toast({
      tone: 'live', icon: Video01Icon, duration: Infinity,
      title: LIVE_SESSION.title + ' is live', desc: 'Today \u00b7 Google Meet',
      action: { label: 'Join', href: MEET_LINK }, secondary: { label: 'Details', onClick: () => showDay(LIVE_SESSION.date) },
    }), 600);
    return () => clearTimeout(t);
  }, []);

  const open = todos.filter((t) => !t.done).length;
  const navGroups = [
    [null, [['overview', 'Overview']]],
    ['Cohort', [['calendar', 'Calendar'], ['resources', 'Resources', RESOURCES.length], ['todos', 'To-dos', open], ['tools', 'Tools']]],
  ];
  const layoutItems = [['calendar', 'Calendar'], ['resources', 'Resources'], ['todos', 'To-dos'], ['tools', 'Tools']];

  return (
    <ToastCtx.Provider value={toast}>
    <div className="app">
      <nav className="sidebar" aria-label="Main">
        <div className="brand">
          <a className="logo" href="/">{BRAND}</a>
          <div className="cohort-id">
            <span className="cohort-mark" aria-hidden="true"><Icon icon={Mortarboard01Icon} size={18} bold /></span>
            <span><b>{COHORT.name}</b>Cohort #{COHORT.number}</span>
          </div>
        </div>

        <div className="nav">
          {navGroups.map(([group, items]) => (
            <div key={group || 'top'} className="nav-group" role="group" aria-label={group || undefined}>
              {group && <span className="nav-label">{group}</span>}
              {items.map(([k, label, count]) => {
                const current = view === k || (isSession && k === 'overview');
                return (
                  <button key={k} type="button" className="nav-item" aria-current={current ? 'page' : undefined} onClick={() => go(k)}>
                    <Icon icon={NAV_ICONS[k]} size={20} bold={current} /><span>{label}</span>
                    {count !== undefined && <span className="count mono">{count}</span>}
                  </button>
                );
              })}
            </div>
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

        {view !== 'overview' && !isSession && <h1 className="view-title">{VIEWS[view]}</h1>}
        {view === 'overview' && <Home todayKey={todayKey} onOpenSession={openSession} />}
        {isSession && SESSION_PAGES[sessionKey] && (
          <SessionPage dayKey={sessionKey} onOpenDay={showDay} onOpenSession={openSession} onBack={() => go('overview')} />
        )}

        {!isSession && (
          <div className={'cards' + (view !== 'overview' ? ' single' : '')}>
            {visible('calendar') && <Calendar big={view === 'calendar'} todayKey={todayKey} onOpenDay={openDay} selectedKey={panel?.type === 'day' ? panel.key : null} />}
            {visible('resources') && <Resources query={query} onOpen={openResource} selected={panel?.type === 'resource' ? panel.item.name : null} />}
            {visible('todos') && <Todos todos={todos} setTodos={setTodos} query={query} />}
            {visible('tools') && <Tools />}
          </div>
        )}
      </main>

      {panel?.type === 'resource' && <DetailPanel item={panel.item} onClose={() => setPanel(null)} onSelect={(item) => setPanel({ type: 'resource', item })} />}
      {panel?.type === 'day' && (
        <DayPanel
          dayKey={panel.key}
          onClose={() => setPanel(null)}
          onOpenDay={showDay}
          onOpenPage={SESSION_PAGES[panel.key] && view !== 'session:' + panel.key ? () => openSession(panel.key) : null}
        />
      )}
      {!panel && <EmptyPanel />}

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
    </ToastCtx.Provider>
  );
}
