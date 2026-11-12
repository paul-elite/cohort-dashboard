import { useEffect, useMemo, useRef, useState } from 'react';
import { WORKSPACE } from './data.js';

/* ==========================================================================
   Magazine workspace shell (Figma "Cohort" file, Page 1).
   Three columns: a 260px left rail (brand, links, reading meta, preferences),
   a 600px reading column under a top bar, and a 260px inspector rail.
   ========================================================================== */

// Icons exported from the Figma file, at their native sizes.
const WS_ICONS = {
  'square-equal': 16, type: 15, clock: 15, settings: 15, search: 12.1638, 'more-vertical': 20, chevron: 18,
};
export function WsIcon({ name, className = '' }) {
  const s = WS_ICONS[name];
  return <img className={'ws-ic ' + className} src={`/ws/${name}.svg`} width={s} height={s} alt="" aria-hidden="true" />;
}

export function Brand() {
  return (
    <div className="ws-brand">
      <WsIcon name="square-equal" />
      <span>{WORKSPACE}</span>
    </div>
  );
}

function load(key, fallback) {
  try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch (e) { /* storage unavailable */ }
  return fallback;
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
}

/* Close a popover on outside press or Escape. */
function useDismiss(open, ref, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const key = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); };
  }, [open, ref, onClose]);
}

/* ---------- Reading meta: icon + text rows at the foot of a rail ---------- */
export function Meta({ rows }) {
  if (!rows?.length) return null;
  return (
    <ul className="ws-meta">
      {rows.map((r) => (
        <li key={r.text}><WsIcon name={r.icon} /><span>{r.text}</span></li>
      ))}
    </ul>
  );
}

/* ---------- Left rail ---------- */
export function LeftRail({ groups, meta, prefs, open, onClose }) {
  const [prefsOpen, setPrefsOpen] = useState(false);
  const prefsRef = useRef(null);
  useDismiss(prefsOpen, prefsRef, () => setPrefsOpen(false));

  const pick = (fn) => (e) => { fn(e); onClose?.(); };

  return (
    <nav className={'ws-rail ws-left' + (open ? ' open' : '')} aria-label="Workspace">
      <div className="ws-rail-top">
        <Brand />
        <div className="ws-groups">
          {groups.map((g) => (
            <div className="ws-group" key={g.label} role="group" aria-label={g.label}>
              {g.showLabel && <span className="ws-group-label">{g.label}</span>}
              {g.items.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  className={'ws-link' + (it.current ? ' on' : '')}
                  aria-current={it.current ? (g.toc ? 'location' : 'page') : undefined}
                  onClick={pick(it.onClick)}
                  title={it.label}
                >
                  <span className="ws-link-text">{it.label}</span>
                  {it.count !== undefined && <span className="ws-count">{it.count}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="ws-rail-foot">
        <Meta rows={meta} />
        <div className="ws-prefs-wrap" ref={prefsRef}>
          {prefsOpen && <div className="ws-pop" role="dialog" aria-label="Preferences">{prefs}</div>}
          <button type="button" className="ws-prefs" aria-expanded={prefsOpen} onClick={() => setPrefsOpen((v) => !v)}>
            <WsIcon name="settings" />Preferences
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ---------- Top bar: back pill, breadcrumb, search trigger ---------- */
export function TopBar({ canBack, onBack, crumbs, onSearch, onMenu }) {
  return (
    <header className="ws-top">
      <div className="ws-top-left">
        <button type="button" className="ws-menu" aria-label="Open navigation" onClick={onMenu}><WsIcon name="square-equal" /></button>
        <button type="button" className="ws-back" disabled={!canBack} onClick={onBack}>
          <WsIcon name="chevron" className="ws-back-ic" />Back
        </button>
        <ol className="ws-crumbs" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <li key={c.label + i}>
              {i > 0 && <span className="ws-sep" aria-hidden="true">/</span>}
              {c.onClick
                ? <button type="button" onClick={c.onClick}>{c.label}</button>
                : <span aria-current="page">{c.label}</span>}
            </li>
          ))}
        </ol>
      </div>
      <button type="button" id="search" className="ws-search-trigger" aria-haspopup="dialog" onClick={onSearch}>
        <WsIcon name="search" />
        <span>Search anything here...</span>
        <kbd aria-hidden="true">/</kbd>
      </button>
    </header>
  );
}

/* ---------- Search: frosted layer, recent searches, grouped results ---------- */
const RECENT_KEY = 'cohort-recent-searches';

export function SearchOverlay({ open, onClose, index, onPick }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState(() => load(RECENT_KEY, []));
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setQ(''); setActive(0);
    const back = document.activeElement;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => { cancelAnimationFrame(id); back?.focus?.({ preventScroll: true }); };
  }, [open]);
  useEffect(() => save(RECENT_KEY, recent), [recent]);

  const term = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!term) return [];
    return index
      .filter((it) => `${it.label} ${it.hint || ''} ${it.keywords || ''}`.toLowerCase().includes(term))
      .sort((a, b) => Number(!a.label.toLowerCase().startsWith(term)) - Number(!b.label.toLowerCase().startsWith(term)))
      .slice(0, 14);
  }, [term, index]);

  // One flat list drives the keyboard; groups are only for display.
  const flat = term ? results : recent.map((r) => ({ id: 'recent:' + r, label: r, recent: true }));
  const groups = useMemo(() => {
    const out = [];
    results.forEach((it, i) => {
      let g = out.find((x) => x.name === it.group);
      if (!g) { g = { name: it.group, items: [] }; out.push(g); }
      g.items.push({ ...it, i });
    });
    return out;
  }, [results]);

  useEffect(() => { setActive(0); }, [term]);
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const remember = (text) => setRecent((cur) => [text, ...cur.filter((r) => r.toLowerCase() !== text.toLowerCase())].slice(0, 5));
  const pick = (item) => {
    if (!item) return;
    if (item.recent) { setQ(item.label); inputRef.current?.focus(); return; }
    remember(q.trim() || item.label);
    onPick(item);
    onClose();
  };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(flat[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); if (q) setQ(''); else onClose(); }
  };

  const Row = ({ item, i }) => (
    <li
      id={'ws-opt-' + i}
      role="option"
      aria-selected={i === active}
      className={'ws-row' + (i === active ? ' on' : '')}
      onMouseMove={() => setActive(i)}
      onClick={() => pick(item)}
    >
      <span className="ws-row-main">
        <span className="ws-aa" aria-hidden="true">Aa</span>
        <span className="ws-row-label">{item.label}</span>
        {item.hint && <span className="ws-row-hint">{item.hint}</span>}
      </span>
      <img className="ws-row-go" src="/icons/font.svg" width="11" height="15" alt="" aria-hidden="true" />
    </li>
  );

  return (
    <div className="ws-search-layer" role="dialog" aria-modal="true" aria-label="Search" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ws-search-box" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="ws-search-field">
          <WsIcon name="search" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls="ws-results"
            aria-activedescendant={flat.length ? 'ws-opt-' + active : undefined}
            aria-label="Search sessions, resources and to-dos"
            placeholder="Search anything here..."
            autoComplete="off"
            spellCheck="false"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
          />
          <kbd aria-hidden="true">esc</kbd>
        </div>

        <div className="ws-results" id="ws-results" role="listbox" aria-label="Search results" ref={listRef}>
          {!term && recent.length > 0 && (
            <div className="ws-panel">
              <div className="ws-panel-head">
                <span>Recent searches</span>
                <button type="button" onClick={() => { setRecent([]); inputRef.current?.focus(); }}>Clear recent</button>
              </div>
              <ul role="group" aria-label="Recent searches">
                {flat.map((item, i) => <Row key={item.id} item={item} i={i} />)}
              </ul>
            </div>
          )}
          {!term && recent.length === 0 && (
            <div className="ws-panel ws-panel-note">Search sessions, resources, to-dos and pages.</div>
          )}
          {term && groups.map((g) => (
            <div className="ws-panel" key={g.name}>
              <div className="ws-panel-head"><span>{g.name}</span><span>{g.items.length}</span></div>
              <ul role="group" aria-label={g.name}>
                {g.items.map((item) => <Row key={item.id} item={item} i={item.i} />)}
              </ul>
            </div>
          ))}
          {term && results.length === 0 && (
            <div className="ws-panel ws-panel-note">No results for “{q.trim()}”.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Inspector (right rail) ---------- */
export function Inspector({ open, onClose, meta, label, children }) {
  return (
    <aside className={'ws-rail ws-right' + (open ? ' open' : '')} aria-label={label || 'Details'}>
      <div className="ws-rail-top ws-inspector">
        <div className="ws-inspector-head">
          <Brand />
          {open && <button type="button" className="ws-close" aria-label="Close details" onClick={onClose}>Close</button>}
        </div>
        {children}
      </div>
      <div className="ws-rail-foot"><Meta rows={meta} /></div>
    </aside>
  );
}

export function Facts({ rows }) {
  return (
    <dl className="ws-facts">
      {rows.filter(Boolean).map(([k, v]) => (
        <div className="ws-fact" key={k}><dt>{k}:</dt><dd>{v}</dd></div>
      ))}
    </dl>
  );
}

/* ---------- Card menu (the ⋮ in a card head) ---------- */
export function CardMenu({ label, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(open, ref, () => setOpen(false));
  return (
    <div className="ws-menu-wrap" ref={ref}>
      <button type="button" className="ws-more" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <WsIcon name="more-vertical" />
      </button>
      {open && (
        <ul className="ws-pop ws-menu-pop" role="menu">
          {items.map((it) => (
            <li key={it.label} role="none">
              <button type="button" role="menuitem" onClick={() => { setOpen(false); it.onClick(); }}>{it.label}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- A section of the reading column: heading, dek, then its card ---------- */
export function Block({ id, title, desc, children, wide }) {
  return (
    <section className={'ws-block' + (wide ? ' wide' : '')} aria-labelledby={id}>
      <div className="ws-block-head">
        <h2 id={id}>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
      {children}
    </section>
  );
}
