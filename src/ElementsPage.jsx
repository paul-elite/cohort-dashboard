import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon, CalendarAdd01Icon, Cancel01Icon, Link04Icon, Search01Icon,
  SparklesIcon, Tick02Icon, Video01Icon,
} from '@hugeicons/core-free-icons';
import { SESSIONS } from './data.js';
import CoverArt from './CoverArt.jsx';

function Icon({ icon, size = 20, bold = false, ...rest }) {
  return <HugeiconsIcon icon={icon} size={size} color="currentColor" strokeWidth={bold ? 2 : 1} absoluteStrokeWidth={!bold} aria-hidden="true" focusable="false" {...rest} />;
}

const tagOf = (key, i) => SESSIONS[key].tags[i];

/* ---------- Live specimens ---------- */
function ButtonLive() {
  return (
    <div className="el-row">
      <a className="btn primary" href="https://meet.google.com/" target="_blank" rel="noreferrer">
        <Icon icon={Video01Icon} size={18} bold />Join on Meet
      </a>
      <button type="button" className="btn glass">
        <Icon icon={CalendarAdd01Icon} size={18} />Add to calendar
      </button>
    </div>
  );
}

function SearchLive() {
  const [q, setQ] = useState('');
  return (
    <div className={'search el-search' + (q ? ' filled' : '')}>
      <Icon icon={Search01Icon} size={18} />
      <label className="sr-only" htmlFor="el-search">Demo search</label>
      <input id="el-search" type="search" placeholder="Search anything here" value={q} onChange={(e) => setQ(e.target.value)} />
      {q
        ? <button type="button" className="clear" aria-label="Clear search" onClick={() => setQ('')}><Icon icon={Cancel01Icon} size={16} /></button>
        : <kbd className="hint" aria-hidden="true">/</kbd>}
    </div>
  );
}

function TagLive() {
  return (
    <span className="el-tagrow">
      {[tagOf('2026-10-10', 0), tagOf('2026-10-10', 1), tagOf('2026-10-24', 0), tagOf('2026-10-17', 0)].map((t) => (
        <span className="sess-tag" key={t.label}><i style={{ background: t.color }} />{t.label}</span>
      ))}
    </span>
  );
}

function TodoLive() {
  const [done, setDone] = useState(false);
  return (
    <div className="el-todo-wrap">
      <button
        type="button"
        className={'el-todo' + (done ? ' done' : '')}
        aria-pressed={done}
        onClick={() => setDone((d) => !d)}
      >
        <span className={'check' + (done ? ' on' : '')}>{done && <Icon icon={Tick02Icon} size={13} bold />}</span>
        <span className="el-todo-text">Read chapter on type hierarchy</span>
        <span className="el-todo-meta mono">{done ? 'Done' : 'Open'}</span>
      </button>
      <p className="el-hint">Click the row to move it between open and done.</p>
    </div>
  );
}

function SegLive() {
  const [value, setValue] = useState('all');
  return (
    <div className="sess-seg" role="group" aria-label="Demo session filter">
      {[['all', 'All'], ['done', 'Done'], ['upcoming', 'Upcoming']].map(([k, label]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => setValue(k)}>{label}</button>
      ))}
    </div>
  );
}

function MiniCard({ hover = false, badge = null }) {
  return (
    <div className={'session-card el-mini-card' + (hover ? ' demo-card-hover' : '')}>
      <span className="sess-cover">
        <span className="sess-top">
          {badge
            ? <span className={'sess-badge ' + badge[1]}><Icon icon={badge[2]} size={13} bold />{badge[0]}</span>
            : <span />}
          <span className="sess-issue">Session 01</span>
        </span>
        <span className="sess-body"><CoverArt kind="type" /></span>
        <span className="sess-tags">
          {SESSIONS['2026-10-10'].tags.map((t) => <span key={t.label} className="sess-tag"><i style={{ background: t.color }} />{t.label}</span>)}
        </span>
      </span>
      <span className="session-lines">
        <span className="session-name">How Humans Read</span>
        <span className="session-sub">October 10 · 6:00 PM WAT</span>
      </span>
    </div>
  );
}

function ToastLive() {
  const [shown, setShown] = useState(true);
  if (!shown) {
    return <button type="button" className="btn ghost" onClick={() => setShown(true)}>Show the toast again</button>;
  }
  return (
    <div className="toast tone-live el-toast">
      <span className="toast-icon"><Icon icon={Video01Icon} size={18} bold /></span>
      <div className="toast-text">
        <p className="toast-title">How Humans Read is live</p>
        <p className="toast-desc">Today · Google Meet</p>
      </div>
      <a className="toast-action" href="https://meet.google.com/" target="_blank" rel="noreferrer">Join</a>
      <button type="button" className="toast-close" aria-label="Dismiss demo toast" onClick={() => setShown(false)}><Icon icon={Cancel01Icon} size={14} /></button>
    </div>
  );
}

/* ---------- Reference data ---------- */
const ELEMENTS = [
  {
    id: 'button',
    no: '01',
    name: 'Button',
    kind: 'Actions',
    dek: 'The one thing you want someone to do next, with every supporting action one step quieter.',
    live: <ButtonLive />,
    parts: [
      { name: 'Container', spec: '32px tall · 10px radius', visual: <span className="pv-btn" /> },
      { name: 'Label', spec: 'SF Pro · 13px / 510', visual: <span className="pv-type">Join</span> },
      { name: 'Icon', spec: '18px · 2px stroke', visual: <span className="pv-icon"><Icon icon={Video01Icon} size={20} bold /></span> },
      { name: 'Pairing', spec: '10px gap · blue + grey', visual: <span className="pv-gap"><i /><b /><i /></span> },
    ],
    states: [
      { label: 'Default', node: <button type="button" className="btn primary"><Icon icon={Video01Icon} size={16} bold />Join</button> },
      { label: 'Hover', node: <button type="button" className="btn primary demo-hover"><Icon icon={Video01Icon} size={16} bold />Join</button> },
      { label: 'Focus', node: <button type="button" className="btn primary demo-focus"><Icon icon={Video01Icon} size={16} bold />Join</button> },
      { label: 'Disabled', node: <button type="button" className="btn primary demo-disabled" disabled><Icon icon={Video01Icon} size={16} bold />Join</button> },
    ],
    rule: 'One primary action per view. Supporting actions are glass; anything tertiary is a ghost button.',
  },
  {
    id: 'search',
    no: '02',
    name: 'Search field',
    kind: 'Inputs',
    dek: 'One field for sessions, files and to-dos. A half-pixel hairline does the framing.',
    live: <SearchLive />,
    parts: [
      { name: 'Field', spec: '32px tall · full pill', visual: <span className="pv-hair" /> },
      { name: 'Hairline', spec: '0.5px · state colour', visual: <span className="pv-line" /> },
      { name: 'Icon', spec: '12px · 1.5px stroke', visual: <span className="pv-icon"><Icon icon={Search01Icon} size={20} /></span> },
      { name: 'Shortcut', spec: '18px keycap · "/"', visual: <span className="pv-key">/</span> },
    ],
    states: [
      { label: 'Rest', node: <div className="search"><Icon icon={Search01Icon} size={16} /><input readOnly placeholder="Search" aria-label="Rest state" /><kbd className="hint">/</kbd></div> },
      { label: 'Hover', node: <div className="search demo-hair-hover"><Icon icon={Search01Icon} size={16} /><input readOnly placeholder="Search" aria-label="Hover state" /><kbd className="hint">/</kbd></div> },
      { label: 'Focus', node: <div className="search demo-hair-focus"><Icon icon={Search01Icon} size={16} /><input readOnly placeholder="Search" aria-label="Focus state" /><kbd className="hint">/</kbd></div> },
      { label: 'Filled', node: <div className="search filled"><Icon icon={Search01Icon} size={16} /><input readOnly defaultValue="typography" aria-label="Filled state" /><button type="button" className="clear" aria-label="Clear"><Icon icon={Cancel01Icon} size={14} /></button></div> },
    ],
    stateMin: '280px',
    rule: 'Escape clears the field and the shortcut hint disappears while typing, so the field never repeats itself.',
  },
  {
    id: 'tag',
    no: '03',
    name: 'Tag',
    kind: 'Content',
    dek: 'A colour-coded subject label. The dot is a hint; the word is the label.',
    live: <TagLive />,
    parts: [
      { name: 'Dot', spec: '6px · category colour', visual: <span className="pv-dot" /> },
      { name: 'Label', spec: '11px · sentence case', visual: <span className="pv-caps">Reading</span> },
      { name: 'Gap', spec: '6px dot to word', visual: <span className="pv-gap"><i /><b /><i /></span> },
      { name: 'Row', spec: '12px between tags', visual: <span className="pv-dots"><i style={{ background: '#6A45FF' }} /><i style={{ background: '#1FCB6B' }} /><i style={{ background: '#FFC21A' }} /></span> },
    ],
    compare: {
      yes: 'Dot and word together. The colour speeds up scanning; the label carries the meaning.',
      no: 'Dots alone. Two of these are indistinguishable without colour, and neither survives a greyscale print.',
    },
    compareNodes: {
      yes: (
        <span className="el-tagrow">
          <span className="sess-tag"><i style={{ background: tagOf('2026-10-10', 0).color }} />Type</span>
          <span className="sess-tag"><i style={{ background: tagOf('2026-10-10', 1).color }} />Reading</span>
        </span>
      ),
      no: (
        <span className="el-tagrow">
          <span className="sess-tag"><i style={{ background: tagOf('2026-10-10', 0).color }} /></span>
          <span className="sess-tag"><i style={{ background: tagOf('2026-10-17', 0).color }} /></span>
        </span>
      ),
    },
    rule: 'Colour is decoration, never the only signal. Every tag keeps its word.',
  },
  {
    id: 'checkbox',
    no: '04',
    name: 'Checkbox row',
    kind: 'Inputs',
    dek: 'A to-do is a checkbox with a sentence attached — and a strike when it is done.',
    live: <TodoLive />,
    parts: [
      { name: 'Box', spec: '18px · 6px radius', visual: <span className="pv-box" /> },
      { name: 'Tick', spec: '12px · 2px stroke', visual: <span className="pv-box on"><Icon icon={Tick02Icon} size={12} bold /></span> },
      { name: 'Label', spec: '15px · line 1.45', visual: <span className="pv-text">Read chapter</span> },
      { name: 'Done', spec: 'strike · text-3', visual: <span className="pv-text done">Read chapter</span> },
    ],
    states: [
      { label: 'Open', node: <span className="el-state-row"><span className="check" /><span className="el-state-text">Read chapter</span></span> },
      { label: 'Done', node: <span className="el-state-row"><span className="check on"><Icon icon={Tick02Icon} size={13} bold /></span><span className="el-state-text done">Read chapter</span></span> },
    ],
    stateMin: '210px',
    rule: 'Done is shape first: the tick and the strike still read without colour.',
  },
  {
    id: 'segmented',
    no: '05',
    name: 'Segmented control',
    kind: 'Navigation',
    dek: 'A small set of views with one current. The thumb — not a colour — marks the choice.',
    live: <SegLive />,
    parts: [
      { name: 'Track', spec: '10px radius · 2px inset · #f2f2f3', visual: <span className="pv-track"><i /></span> },
      { name: 'Thumb', spec: 'white · 0.5px ring', visual: <span className="pv-thumb" /> },
      { name: 'Option', spec: '26px tall · 12px inset', visual: <span className="pv-or">Upcoming</span> },
      { name: 'Press', spec: 'aria-pressed', visual: <span className="pv-code">aria</span> },
    ],
    states: [
      { label: 'Selected', node: <div className="sess-seg"><button type="button" aria-pressed="true">All</button><button type="button" aria-pressed="false">Done</button></div> },
      { label: 'Rest', node: <div className="sess-seg"><button type="button" aria-pressed="false">All</button><button type="button" aria-pressed="false">Done</button></div> },
      { label: 'Hover', node: <div className="sess-seg"><button type="button" aria-pressed="false" className="demo-text-hover">All</button><button type="button" aria-pressed="true">Done</button></div> },
    ],
    stateMin: '150px',
    rule: 'Two to four options that change the view. If it performs an action, it is a button.',
  },
  {
    id: 'card',
    no: '06',
    name: 'Session card',
    kind: 'Content',
    dek: 'The archive is a wall of covers. Each one has to identify a session before it is read.',
    live: <MiniCard />,
    parts: [
      { name: 'Cover', spec: '0.87 ratio · 16px radius', visual: <span className="pv-cover">Aa</span> },
      { name: 'Issue', spec: 'pill · session number', visual: <span className="pv-issue">01</span> },
      { name: 'Tags', spec: 'dot + subject', visual: <span className="pv-dots"><i style={{ background: '#6A45FF' }} /><i style={{ background: '#1FCB6B' }} /></span> },
      { name: 'Title', spec: '14px / 500 + date', visual: <span className="pv-title">How Humans Read</span> },
    ],
    states: [
      { label: 'Rest', node: <MiniCard /> },
      { label: 'Hover', node: <MiniCard hover /> },
      { label: 'Next', node: <MiniCard badge={['Next', 'next', SparklesIcon]} /> },
    ],
    stateMin: '150px',
    stateTall: true,
    rule: 'The cover sets the tone; the number, title and date do the identifying.',
  },
  {
    id: 'toast',
    no: '07',
    name: 'Toast',
    kind: 'Feedback',
    dek: 'A quiet confirmation that something happened, with one way to act on it.',
    live: <ToastLive />,
    parts: [
      { name: 'Icon tile', spec: '36px · 10px radius', visual: <span className="pv-toast-icon"><Icon icon={Video01Icon} size={16} bold /></span> },
      { name: 'Title', spec: '15px / 500', visual: <span className="pv-text">Live now</span> },
      { name: 'Action', spec: '32px pill', visual: <span className="pv-action-pill">Join</span> },
      { name: 'Dismiss', spec: '28px hit area', visual: <span className="pv-close"><Icon icon={Cancel01Icon} size={14} /></span> },
    ],
    states: [
      { label: 'Info', node: <div className="toast tone-info"><span className="toast-icon"><Icon icon={Link04Icon} size={16} bold /></span><div className="toast-text"><p className="toast-title">Link copied</p><p className="toast-desc">Paste it anywhere.</p></div><button type="button" className="toast-close" aria-label="Dismiss"><Icon icon={Cancel01Icon} size={14} /></button></div> },
      { label: 'Success', node: <div className="toast tone-success"><span className="toast-icon"><Icon icon={Tick02Icon} size={16} bold /></span><div className="toast-text"><p className="toast-title">Nice, that’s done</p><p className="toast-desc">Read chapter on type.</p></div><button type="button" className="toast-action quiet">Undo</button><button type="button" className="toast-close" aria-label="Dismiss"><Icon icon={Cancel01Icon} size={14} /></button></div> },
      { label: 'Live', node: <div className="toast tone-live"><span className="toast-icon"><Icon icon={Video01Icon} size={16} bold /></span><div className="toast-text"><p className="toast-title">Session is live</p><p className="toast-desc">Today · Google Meet</p></div><button type="button" className="toast-action">Join</button><button type="button" className="toast-close" aria-label="Dismiss"><Icon icon={Cancel01Icon} size={14} /></button></div> },
    ],
    stateMin: '290px',
    rule: 'One line, one action, always dismissible. It never blocks the page.',
  },
];

const FILTERS = [
  ['all', 'All'],
  ['Actions', 'Actions'],
  ['Inputs', 'Inputs'],
  ['Content', 'Content'],
  ['Navigation', 'Nav'],
  ['Feedback', 'Feedback'],
];

/* ---------- The page ---------- */
export default function ElementsPage() {
  const [filter, setFilter] = useState('all');
  const [announce, setAnnounce] = useState('');

  useEffect(() => {
    document.querySelector('.main')?.scrollTo?.({ top: 0 });
    document.querySelector('.app')?.scrollTo?.({ top: 0 });
    window.scrollTo?.({ top: 0 });
  }, []);

  const shown = filter === 'all' ? ELEMENTS : ELEMENTS.filter((el) => el.kind === filter);

  const jump = (id) => {
    setFilter('all');
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      document.getElementById('el-' + id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, 30);
  };

  const pick = (kind) => {
    setFilter(kind);
    setAnnounce(kind === 'all' ? 'Showing all elements' : `Showing ${kind.toLowerCase()}`);
  };

  return (
    <article className="els">
      <header className="els-head">
        <span className="els-eyebrow">Interface reference · {ELEMENTS.length} elements</span>
        <h1>UI elements</h1>
        <p className="els-dek">
          The dashboard, taken apart. Every element below is the real component, shown with the parts it is
          built from, the states it has to survive, and the rule that keeps it consistent.
        </p>
        <div className="els-meta">
          <span>Live stage</span><i aria-hidden="true" />
          <span>Measured at 1×</span><i aria-hidden="true" />
          <span>Same tokens as the app</span>
        </div>
      </header>

      <nav className="els-index" aria-label="Elements on this page">
        {ELEMENTS.map((el) => (
          <a key={el.id} href={'#el-' + el.id} onClick={(e) => { e.preventDefault(); jump(el.id); }}>
            <span className="mono">{el.no}</span>{el.name}
          </a>
        ))}
      </nav>

      <div className="els-bar">
        <div className="sess-seg" role="group" aria-label="Filter elements">
          {FILTERS.map(([k, label]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => pick(k)}>{label}</button>
          ))}
        </div>
        <span className="els-count mono" aria-live="polite">{shown.length} shown<span className="sr-only">, {announce}</span></span>
      </div>

      <div className="els-list">
        {shown.map((el) => (
          <section className="el" key={el.id} id={'el-' + el.id} aria-labelledby={'el-h-' + el.id}>
            <div className="el-head">
              <span className="el-no">{el.no}</span>
              <h2 id={'el-h-' + el.id}>{el.name}</h2>
              <span className="el-kind">{el.kind}</span>
            </div>
            <p className="el-dek">{el.dek}</p>

            <div className="el-stage">
              <span className="el-stage-tag">Live</span>
              {el.live}
            </div>

            <div className="el-anatomy">
              <span className="el-sub">Anatomy</span>
              <div className="el-parts">
                {el.parts.map((part, i) => (
                  <div className="el-part" key={part.name}>
                    <span className="el-part-no mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span className="el-part-visual" aria-hidden="true">{part.visual}</span>
                    <span className="el-part-name">{part.name}</span>
                    <span className="el-part-spec">{part.spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {el.states && (
              <div className="el-states">
                <span className="el-sub">States</span>
                <div className="el-state-grid" style={el.stateMin ? { '--state-min': el.stateMin } : undefined}>
                  {el.states.map((state) => (
                    <div className={'el-state' + (el.stateTall ? ' tall' : '')} key={state.label}>
                      {state.node}
                      <span className="el-state-label">{state.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {el.compare && (
              <div className="el-compare">
                <div className="el-compare-cell yes">
                  <span className="el-compare-tag">Do</span>
                  {el.compareNodes.yes}
                  <p>{el.compare.yes}</p>
                </div>
                <div className="el-compare-cell no">
                  <span className="el-compare-tag">Don’t</span>
                  {el.compareNodes.no}
                  <p>{el.compare.no}</p>
                </div>
              </div>
            )}

            <p className="el-rule"><b>Rule</b><span>{el.rule}</span></p>
          </section>
        ))}
      </div>

      <footer className="els-foot">
        <span className="els-eyebrow">End of reference</span>
        <p>These are the same classes the app ships with — if an element changes here, it changes everywhere.</p>
        <button type="button" className="btn ghost" onClick={() => jump(ELEMENTS[0].id)}>
          Back to the top<Icon icon={ArrowRight01Icon} size={16} className="els-up" />
        </button>
      </footer>
    </article>
  );
}
