import { useEffect, useMemo, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon, GridViewIcon, ListViewIcon } from '@hugeicons/core-free-icons';
import { COHORT } from './data.js';

/* ==========================================================================
   Resources as a file manager: toolbar (kind filter, sort, view), a sortable
   list or an icon grid, keyboard selection and a status bar. Selecting a file
   opens it in the details rail; double-click or Enter opens the file itself.
   ========================================================================== */

const ART = { recording: '/icons/recording.svg', font: '/icons/font.svg', audio: '/icons/audio.svg', zip: '/icons/zip.svg', book: '/icons/book.svg' };
const KINDS = [['all', 'All kinds'], ['recording', 'Videos'], ['font', 'Fonts'], ['audio', 'Audio'], ['zip', 'Archives'], ['book', 'Books']];
const SORTS = { name: 'Name', kind: 'Kind', added: 'Date added' };

function Icon({ icon, size = 16 }) {
  return <HugeiconsIcon icon={icon} size={size} color="currentColor" strokeWidth={1.5} aria-hidden="true" focusable="false" />;
}
function load(key, fallback) {
  try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch (e) { /* storage unavailable */ }
  return fallback;
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
}
const fullDate = (iso) => (iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');
const openFile = (f) => { if (f.href && f.href !== '#') window.open(f.href, '_blank', 'noreferrer'); };

export default function FileManager({ files, selected, onSelect, compact = false, flat = false }) {
  const [view, setView] = useState(() => load('cohort-fm-view', 'list'));
  const [sort, setSort] = useState(() => load('cohort-fm-sort', { key: 'added', dir: 'desc' }));
  const [kind, setKind] = useState('all');
  useEffect(() => save('cohort-fm-view', view), [view]);
  useEffect(() => save('cohort-fm-sort', sort), [sort]);

  const shown = useMemo(() => {
    const list = files.filter((f) => kind === 'all' || f.icon === kind);
    const val = (f) => (sort.key === 'added' ? new Date(f.added || 0).getTime() : String(f[sort.key] || '').toLowerCase());
    list.sort((a, b) => {
      const x = val(a); const y = val(b);
      const c = x < y ? -1 : x > y ? 1 : 0;
      return sort.dir === 'asc' ? c : -c;
    });
    return list;
  }, [files, kind, sort]);

  const setSortKey = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'added' ? 'desc' : 'asc' }));

  // Keyboard: arrows move the selection, Enter opens, Home/End jump.
  const listRef = useRef(null);
  const selIndex = shown.findIndex((f) => f.name === selected);
  const focusRow = (i) => { const el = listRef.current?.querySelectorAll('[data-file]')[i]; el?.focus(); };
  const onKey = (e) => {
    const cols = view === 'grid' ? Math.max(1, Math.round((listRef.current?.clientWidth || 600) / 140)) : 1;
    const at = selIndex < 0 ? 0 : selIndex;
    const go = (i) => { const n = Math.max(0, Math.min(shown.length - 1, i)); onSelect(shown[n]); focusRow(n); e.preventDefault(); };
    if (e.key === 'ArrowDown') go(selIndex < 0 ? 0 : at + cols);
    else if (e.key === 'ArrowUp') go(at - cols);
    else if (e.key === 'ArrowRight' && view === 'grid') go(at + 1);
    else if (e.key === 'ArrowLeft' && view === 'grid') go(at - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(shown.length - 1);
    else if (e.key === 'Enter' && selIndex >= 0) { e.preventDefault(); openFile(shown[selIndex]); }
  };

  const row = (f, i) => {
    const on = f.name === selected;
    const k = f.id || f.name;
    const props = {
      'data-file': true,
      role: 'option',
      'aria-selected': on,
      tabIndex: on || (selIndex < 0 && i === 0) ? 0 : -1,
      className: (view === 'grid' ? 'fm-tile' : 'fm-row') + (on ? ' on' : ''),
      onClick: () => onSelect(f),
      onDoubleClick: () => openFile(f),
      title: f.href && f.href !== '#' ? 'Double-click to open' : undefined,
    };
    if (view === 'grid') {
      return (
        <li key={k} {...props}>
          <span className="fm-tile-art"><img src={ART[f.icon] || ART.zip} width="59" height="82" alt="" /></span>
          <span className="fm-tile-name">{f.name}</span>
          <span className="fm-tile-meta">{f.when}</span>
        </li>
      );
    }
    return (
      <li key={k} {...props}>
        <span className="fm-cell fm-name"><img src={ART[f.icon] || ART.zip} width="16" height="22" alt="" /><span>{f.name}</span></span>
        <span className="fm-cell fm-kind">{f.kind}</span>
        <span className="fm-cell fm-added" title={fullDate(f.added)}>{f.when}</span>
      </li>
    );
  };

  const sel = shown.find((f) => f.name === selected);
  const head = (key, label) => (
    <button type="button" className={'fm-th' + (sort.key === key ? ' on' : '')} onClick={() => setSortKey(key)}
      aria-label={`Sort by ${label}${sort.key === key ? (sort.dir === 'asc' ? ', ascending' : ', descending') : ''}`}>
      {label}{sort.key === key && <Icon icon={sort.dir === 'asc' ? ArrowUp01Icon : ArrowDown01Icon} size={12} />}
    </button>
  );

  return (
    <section className={(flat ? 'fm flat' : 'card fm') + (compact ? ' compact' : '')} aria-label="Resources">
      <div className="fm-bar">
        <div className="fm-loc">
          <span className="fm-title">Shared in {COHORT.name}</span>
        </div>
        <div className="fm-tools">
          <label className="sr-only" htmlFor="fm-kind">Show</label>
          <select id="fm-kind" className="fm-select" value={kind} onChange={(e) => setKind(e.target.value)}>
            {KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          {view === 'grid' && (
            <>
              <label className="sr-only" htmlFor="fm-sort">Sort by</label>
              <select id="fm-sort" className="fm-select" value={sort.key} onChange={(e) => setSortKey(e.target.value)}>
                {Object.entries(SORTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </>
          )}
          <div className="fm-seg" role="group" aria-label="View">
            <button type="button" aria-pressed={view === 'list'} aria-label="List view" onClick={() => setView('list')}><Icon icon={ListViewIcon} /></button>
            <button type="button" aria-pressed={view === 'grid'} aria-label="Icon view" onClick={() => setView('grid')}><Icon icon={GridViewIcon} /></button>
          </div>
        </div>
      </div>

      {view === 'list' && shown.length > 0 && (
        <div className="fm-head" role="presentation">
          {head('name', 'Name')}{head('kind', 'Kind')}{head('added', 'Date added')}
        </div>
      )}
      {shown.length > 0 ? (
        <ul ref={listRef} className={view === 'grid' ? 'fm-grid' : 'fm-list'} role="listbox" aria-label="Files" onKeyDown={onKey}>
          {shown.map(row)}
        </ul>
      ) : (
        <p className="fm-empty">{files.length ? 'No files of this kind.' : 'No files shared yet.'}</p>
      )}

      <div className="fm-status" aria-live="polite">
        <span>{shown.length} {shown.length === 1 ? 'item' : 'items'}{kind !== 'all' ? ` · ${KINDS.find(([k]) => k === kind)[1].toLowerCase()}` : ''}</span>
        {sel && <span className="fm-status-sel">“{sel.name}” selected</span>}
      </div>
    </section>
  );
}
