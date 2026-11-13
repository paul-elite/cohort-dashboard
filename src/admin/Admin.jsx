import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase.js';
import { WsIcon } from '../Workspace.jsx';
import '../styles.css';
import '../workspace.css';
import './admin.css';

/* ==========================================================================
   Admin: edit everything the public site shows. Sign-in is a Supabase magic
   link; row level security only lets emails in public.admins write.
   ========================================================================== */

const ICONS = ['recording', 'font', 'audio', 'zip', 'book'];
const pad = (n) => String(n).padStart(2, '0');
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (v) => (v ? new Date(v).toISOString() : new Date().toISOString());
const shortDate = (k) => new Date(k + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const errText = (e) => e?.message || String(e);

/* ---------- Collections: one config per table ---------- */
const COLLECTIONS = {
  sessions: {
    table: 'sessions', label: 'Sessions', one: 'session',
    desc: 'Each session shows on the home page, the calendar and in search. Add a page to give it a long-form reading page.',
    order: [['date', true]],
    blank: () => ({ date: '', title: '', time_label: '6:00 PM WAT', tags: [], page: null, published: true }),
    title: (r) => r.title || 'Untitled session',
    meta: (r) => [r.date ? shortDate(r.date) : 'No date', r.time_label, r.page ? 'Has page' : null].filter(Boolean).join(' · '),
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true, hint: 'One session per day. The date is its address on the site.' },
      { key: 'time_label', label: 'Time', type: 'text', placeholder: '6:00 PM WAT' },
      { key: 'tags', label: 'Topics', type: 'tags' },
      { key: 'published', label: 'Show on the site', type: 'bool' },
      { key: 'page', label: 'Session page', type: 'json', hint: 'The long-form page as JSON. Leave empty for sessions without a page.' },
    ],
  },
  resources: {
    table: 'resources', label: 'Resources', one: 'resource', sortable: true,
    desc: 'Files and links shared with the cohort. The order here is the order on the site.',
    order: [['position', true], ['added_at', false]],
    blank: () => ({ name: '', kind: '', icon: 'zip', href: '', added_at: new Date().toISOString(), published: true }),
    title: (r) => r.name || 'Untitled resource',
    meta: (r) => [r.kind, r.icon].filter(Boolean).join(' · '),
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'kind', label: 'Type', type: 'text', placeholder: 'Font, Video, ZIP archive…' },
      { key: 'icon', label: 'Icon', type: 'select', options: ICONS },
      { key: 'href', label: 'Link', type: 'url', placeholder: 'https://' },
      { key: 'added_at', label: 'Added', type: 'datetime', hint: 'Shown as “4 days ago” on the site.' },
      { key: 'published', label: 'Show on the site', type: 'bool' },
    ],
  },
  tools: {
    table: 'tools', label: 'Tools', one: 'tool', sortable: true,
    desc: 'Bookmarked tools on the Tools card and in search.',
    order: [['position', true]],
    blank: () => ({ name: '', mark: '', color: '#1d1d1f', href: '', published: true }),
    title: (r) => r.name || 'Untitled tool',
    meta: (r) => r.href || '',
    swatch: (r) => r.color,
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'mark', label: 'Letter', type: 'text', placeholder: 'F', max: 2 },
      { key: 'color', label: 'Colour', type: 'color' },
      { key: 'href', label: 'Link', type: 'url', placeholder: 'https://' },
      { key: 'published', label: 'Show on the site', type: 'bool' },
    ],
  },
  starter_todos: {
    table: 'starter_todos', label: 'Starter to-dos', one: 'to-do', sortable: true,
    desc: 'The list a new visitor starts with. After that, each person’s to-dos live in their own browser.',
    order: [['position', true]],
    blank: () => ({ text: '', done: false }),
    title: (r) => r.text || 'Untitled to-do',
    meta: (r) => (r.done ? 'Starts ticked' : 'Starts open'),
    fields: [
      { key: 'text', label: 'To-do', type: 'text', required: true },
      { key: 'done', label: 'Starts ticked', type: 'bool' },
    ],
  },
};

const NAV = [
  { group: 'Site', items: [['settings', 'Settings']] },
  { group: 'Content', items: [['sessions', 'Sessions'], ['resources', 'Resources'], ['tools', 'Tools'], ['starter_todos', 'Starter to-dos']] },
  { group: 'Access', items: [['admins', 'Admins']] },
];

/* ---------- Toasts ---------- */
function useToasts() {
  const [list, setList] = useState([]);
  const push = useCallback((t) => {
    const id = Math.random();
    setList((l) => [...l.slice(-2), { id, ...t }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), t.tone === 'error' ? 6000 : 3000);
  }, []);
  const node = (
    <ol className="adm-toasts" aria-live="polite">
      {list.map((t) => <li key={t.id} className={'adm-toast ' + (t.tone || '')}>{t.text}</li>)}
    </ol>
  );
  return [push, node];
}

/* ---------- Fields ---------- */
function Field({ f, value, onChange, error }) {
  const id = 'f-' + f.key;
  const common = { id, 'aria-invalid': !!error || undefined, 'aria-describedby': f.hint || error ? id + '-h' : undefined };
  let control;
  if (f.type === 'bool') {
    return (
      <label className="adm-check">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        <span className={'check' + (value ? ' on' : '')} aria-hidden="true">{value && '✓'}</span>
        {f.label}
      </label>
    );
  }
  if (f.type === 'select') {
    control = <select {...common} className="adm-input adm-select" value={value || ''} onChange={(e) => onChange(e.target.value)}>{f.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
  } else if (f.type === 'color') {
    control = (
      <div className="adm-color">
        <input type="color" aria-label={f.label + ' picker'} value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#000000'} onChange={(e) => onChange(e.target.value)} />
        <input {...common} className="adm-input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  } else if (f.type === 'datetime') {
    control = <input {...common} type="datetime-local" className="adm-input" value={toLocalInput(value)} onChange={(e) => onChange(fromLocalInput(e.target.value))} />;
  } else if (f.type === 'tags') {
    control = <TagsField value={value || []} onChange={onChange} />;
  } else if (f.type === 'json') {
    control = <JsonField value={value} onChange={onChange} id={id} />;
  } else {
    control = (
      <input {...common} className="adm-input" type={f.type === 'url' ? 'url' : f.type === 'date' ? 'date' : 'text'}
        value={value ?? ''} placeholder={f.placeholder} maxLength={f.max}
        onChange={(e) => onChange(e.target.value)} />
    );
  }
  return (
    <div className={'adm-field' + (f.type === 'json' ? ' wide' : '')}>
      <label htmlFor={id}>{f.label}{f.required && <span className="adm-req" aria-hidden="true"> *</span>}</label>
      {control}
      {(error || f.hint) && <p id={id + '-h'} className={'adm-hint' + (error ? ' err' : '')}>{error || f.hint}</p>}
    </div>
  );
}

function TagsField({ value, onChange }) {
  const set = (i, patch) => onChange(value.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  return (
    <div className="adm-tags">
      {value.map((t, i) => (
        <div className="adm-tag" key={i}>
          <input type="color" aria-label={`Topic ${i + 1} colour`} value={/^#[0-9a-f]{6}$/i.test(t.color) ? t.color : '#6A45FF'} onChange={(e) => set(i, { color: e.target.value })} />
          <input className="adm-input" aria-label={`Topic ${i + 1} name`} value={t.label} onChange={(e) => set(i, { label: e.target.value })} />
          <button type="button" className="adm-x" aria-label={`Remove topic ${t.label || i + 1}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="adm-add" onClick={() => onChange([...value, { label: '', color: '#6A45FF', ink: '#ffffff' }])}>Add topic</button>
    </div>
  );
}

function JsonField({ value, onChange, id }) {
  const [text, setText] = useState(() => (value ? JSON.stringify(value, null, 2) : ''));
  const [err, setErr] = useState('');
  const last = useRef(value);
  useEffect(() => { if (value !== last.current) { last.current = value; setText(value ? JSON.stringify(value, null, 2) : ''); setErr(''); } }, [value]);
  const edit = (t) => {
    setText(t);
    if (!t.trim()) { setErr(''); last.current = null; onChange(null); return; }
    try {
      const v = JSON.parse(t);
      if (typeof v !== 'object' || Array.isArray(v) || v === null) throw new Error('The page must be a JSON object { … }.');
      setErr(''); last.current = v; onChange(v);
    } catch (e) { setErr(e.message); onChange(undefined); }
  };
  return (
    <>
      <textarea id={id} className="adm-input adm-json" spellCheck="false" value={text} onChange={(e) => edit(e.target.value)} placeholder="{ }" rows={14} />
      {err && <p className="adm-hint err" role="alert">JSON error: {err}</p>}
    </>
  );
}

/* ---------- Collection: list in the column, editor in the inspector ---------- */
function Collection({ cfg, toast, setInspector }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // row id or 'new'

  const load = useCallback(async () => {
    let q = supabase.from(cfg.table).select('*');
    cfg.order.forEach(([col, asc]) => { q = q.order(col, { ascending: asc }); });
    const { data, error: e } = await q;
    if (e) setError(errText(e)); else { setRows(data); setError(''); }
  }, [cfg]);
  useEffect(() => { setRows(null); setSelected(null); load(); }, [load]);
  useEffect(() => {
    const close = () => setSelected(null);
    window.addEventListener('adm-close-editor', close);
    return () => window.removeEventListener('adm-close-editor', close);
  }, []);

  const move = async (i, dir) => {
    const a = rows[i]; const b = rows[i + dir];
    if (!a || !b) return;
    const next = rows.slice(); next[i] = b; next[i + dir] = a;
    setRows(next);
    const updates = next.map((r, idx) => (r.position === idx ? null : supabase.from(cfg.table).update({ position: idx }).eq('id', r.id))).filter(Boolean);
    const res = await Promise.all(updates);
    const bad = res.find((r) => r.error);
    if (bad) { toast({ tone: 'error', text: 'Couldn’t reorder: ' + errText(bad.error) }); }
    load();
  };

  const current = selected === 'new' ? cfg.blank() : rows?.find((r) => r.id === selected);
  useEffect(() => {
    if (!current) { setInspector(null); return; }
    setInspector(
      <Editor key={selected} cfg={cfg} row={current} isNew={selected === 'new'} toast={toast}
        onClose={() => setSelected(null)}
        onSaved={(id) => { load(); setSelected(id); }}
        onDeleted={() => { load(); setSelected(null); }}
        nextPosition={rows ? rows.length : 0}
      />,
    );
  }, [selected, rows]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="ws-block" aria-labelledby="adm-h">
      <div className="ws-block-head">
        <h2 id="adm-h">{cfg.label}</h2>
        <p>{cfg.desc}</p>
      </div>
      <div className="card adm-card">
        <div className="card-head">
          <h2>{rows ? `${rows.length} ${rows.length === 1 ? cfg.one : cfg.label.toLowerCase()}` : 'Loading…'}</h2>
          <button type="button" className="ws-btn primary adm-new" onClick={() => setSelected('new')}>New {cfg.one}</button>
        </div>
        {error && <p className="adm-empty err">Couldn’t load: {error}</p>}
        {rows && rows.length === 0 && <p className="adm-empty">Nothing here yet. Add the first {cfg.one}.</p>}
        {rows && rows.length > 0 && (
          <ul className="adm-rows">
            {rows.map((r, i) => (
              <li key={r.id} className={'adm-row' + (selected === r.id ? ' on' : '')}>
                <button type="button" className="adm-row-main" aria-pressed={selected === r.id} onClick={() => setSelected(selected === r.id ? null : r.id)}>
                  {cfg.swatch && <span className="adm-swatch" style={{ background: cfg.swatch(r) }} aria-hidden="true">{r.mark}</span>}
                  <span className="adm-row-text">
                    <span className="adm-row-title">{cfg.title(r)}</span>
                    <span className="adm-row-meta">{cfg.meta(r)}</span>
                  </span>
                  {r.published === false && <span className="adm-pill">Hidden</span>}
                </button>
                {cfg.sortable && (
                  <span className="adm-order">
                    <button type="button" aria-label={`Move ${cfg.title(r)} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                    <button type="button" aria-label={`Move ${cfg.title(r)} down`} disabled={i === rows.length - 1} onClick={() => move(i, 1)}>↓</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Editor({ cfg, row, isNew, toast, onClose, onSaved, onDeleted, nextPosition }) {
  const [draft, setDraft] = useState(row);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(row);

  const save = async (e) => {
    e?.preventDefault();
    const errs = {};
    cfg.fields.forEach((f) => {
      if (f.required && !String(draft[f.key] ?? '').trim()) errs[f.key] = f.label + ' is required.';
      if (f.type === 'json' && draft[f.key] === undefined) errs[f.key] = 'Fix the JSON before saving.';
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const payload = {};
    cfg.fields.forEach((f) => { payload[f.key] = f.type === 'tags' ? (draft.tags || []).filter((t) => t.label.trim()) : draft[f.key]; });
    if (isNew && cfg.sortable) payload.position = nextPosition;
    const q = isNew
      ? supabase.from(cfg.table).insert(payload).select('id').single()
      : supabase.from(cfg.table).update(payload).eq('id', row.id).select('id').single();
    const { data, error } = await q;
    setBusy(false);
    if (error) {
      const msg = error.code === '23505' ? 'Another ' + cfg.one + ' already uses that date.' : errText(error);
      toast({ tone: 'error', text: 'Couldn’t save: ' + msg });
      return;
    }
    toast({ tone: 'ok', text: (isNew ? 'Added ' : 'Saved ') + cfg.title(draft) });
    onSaved(data.id);
  };

  const remove = async () => {
    setBusy(true);
    const { error } = await supabase.from(cfg.table).delete().eq('id', row.id);
    setBusy(false);
    if (error) { toast({ tone: 'error', text: 'Couldn’t delete: ' + errText(error) }); return; }
    toast({ tone: 'ok', text: 'Deleted ' + cfg.title(row) });
    onDeleted();
  };

  return (
    <form className="adm-editor" onSubmit={save} noValidate>
      <div className="adm-editor-head">
        <p className="adm-editor-kicker">{isNew ? 'New ' + cfg.one : 'Edit ' + cfg.one}</p>
        <button type="button" className="ws-close adm-close" onClick={onClose}>Close</button>
      </div>
      {cfg.fields.map((f) => (
        <Field key={f.key} f={f} value={draft[f.key]} error={errors[f.key]}
          onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} />
      ))}
      <div className="ws-actions adm-actions">
        <button type="button" className="ws-btn" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="submit" className="ws-btn primary" disabled={busy || (!dirty && !isNew)}>{busy ? 'Saving…' : isNew ? 'Add' : 'Save'}</button>
      </div>
      {!isNew && (
        <div className="adm-danger">
          {confirmDelete ? (
            <>
              <span>Delete “{cfg.title(row)}” for good?</span>
              <button type="button" className="adm-link danger" onClick={remove} disabled={busy}>Delete</button>
              <button type="button" className="adm-link" onClick={() => setConfirmDelete(false)}>Keep</button>
            </>
          ) : (
            <button type="button" className="adm-link danger" onClick={() => setConfirmDelete(true)}>Delete {cfg.one}</button>
          )}
        </div>
      )}
    </form>
  );
}

/* ---------- Settings: one row ---------- */
const SETTINGS_FIELDS = [
  { key: 'workspace', label: 'Workspace name', type: 'text', hint: 'Shown at the top of both rails.' },
  { key: 'brand', label: 'Brand', type: 'text', hint: 'Used in the browser tab title.' },
  { key: 'cohort_name', label: 'Cohort name', type: 'text' },
  { key: 'cohort_number', label: 'Cohort number', type: 'text' },
  { key: 'meet_link', label: 'Meet link', type: 'url', placeholder: 'https://meet.google.com/…' },
  { key: 'live_title', label: 'Live session title', type: 'text' },
  { key: 'live_date', label: 'Live session date', type: 'date', hint: 'On this day the site announces the session as live.' },
  { key: 'live_on', label: 'Announce the live session', type: 'bool' },
];

function Settings({ toast }) {
  const [row, setRow] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (error) toast({ tone: 'error', text: 'Couldn’t load settings: ' + errText(error) });
    else { setRow(data); setDraft(data); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);
  if (!draft) return <p className="adm-empty">Loading settings…</p>;
  const dirty = JSON.stringify(draft) !== JSON.stringify(row);
  const save = async (e) => {
    e.preventDefault();
    const n = parseInt(draft.cohort_number, 10);
    if (!Number.isFinite(n) || n < 1) { toast({ tone: 'error', text: 'Cohort number must be a whole number.' }); return; }
    setBusy(true);
    const { id, updated_at, ...rest } = draft; // eslint-disable-line no-unused-vars
    const { error } = await supabase.from('settings').update({ ...rest, cohort_number: n, live_date: rest.live_date || null }).eq('id', 1);
    setBusy(false);
    if (error) toast({ tone: 'error', text: 'Couldn’t save: ' + errText(error) });
    else { toast({ tone: 'ok', text: 'Settings saved' }); load(); }
  };
  return (
    <section className="ws-block" aria-labelledby="adm-h">
      <div className="ws-block-head">
        <h2 id="adm-h">Settings</h2>
        <p>Names, the Meet link and the live-session announcement.</p>
      </div>
      <form className="card adm-card adm-form" onSubmit={save} noValidate>
        <div className="card-head"><h2>Site</h2></div>
        <div className="adm-form-grid">
          {SETTINGS_FIELDS.map((f) => (
            <Field key={f.key} f={f} value={draft[f.key]} onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} />
          ))}
        </div>
        <div className="ws-actions adm-actions">
          <button type="button" className="ws-btn" disabled={!dirty || busy} onClick={() => setDraft(row)}>Discard</button>
          <button type="submit" className="ws-btn primary" disabled={!dirty || busy}>{busy ? 'Saving…' : 'Save settings'}</button>
        </div>
      </form>
    </section>
  );
}

/* ---------- Admins ---------- */
function Admins({ toast, me }) {
  const [rows, setRows] = useState(null);
  const [email, setEmail] = useState('');
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('admins').select('email, created_at').order('created_at');
    if (error) toast({ tone: 'error', text: errText(error) }); else setRows(data);
  }, [toast]);
  useEffect(() => { load(); }, [load]);
  const add = async (e) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast({ tone: 'error', text: 'Enter a valid email address.' }); return; }
    const { error } = await supabase.from('admins').insert({ email: v });
    if (error) toast({ tone: 'error', text: error.code === '23505' ? v + ' is already an admin.' : errText(error) });
    else { setEmail(''); toast({ tone: 'ok', text: v + ' can now edit' }); load(); }
  };
  const remove = async (v) => {
    const { error } = await supabase.from('admins').delete().eq('email', v);
    if (error) toast({ tone: 'error', text: errText(error) }); else { toast({ tone: 'ok', text: v + ' removed' }); load(); }
  };
  return (
    <section className="ws-block" aria-labelledby="adm-h">
      <div className="ws-block-head">
        <h2 id="adm-h">Admins</h2>
        <p>People who can sign in here and edit the site. They sign in with a link sent to their email.</p>
      </div>
      <div className="card adm-card">
        <div className="card-head"><h2>{rows ? `${rows.length} ${rows.length === 1 ? 'admin' : 'admins'}` : 'Loading…'}</h2></div>
        <ul className="adm-rows">
          {(rows || []).map((r) => (
            <li key={r.email} className="adm-row">
              <span className="adm-row-main static">
                <span className="adm-row-text">
                  <span className="adm-row-title">{r.email}</span>
                  <span className="adm-row-meta">{r.email === me ? 'You' : 'Added ' + new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </span>
              </span>
              {r.email !== me && <button type="button" className="adm-link danger adm-row-act" onClick={() => remove(r.email)}>Remove</button>}
            </li>
          ))}
        </ul>
        <form className="adm-inline" onSubmit={add}>
          <label className="sr-only" htmlFor="adm-new-admin">Email to add</label>
          <input id="adm-new-admin" className="adm-input" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="ws-btn primary">Add admin</button>
        </form>
      </div>
    </section>
  );
}

/* ---------- Sign-in ---------- */
function Gate({ children }) {
  return (
    <div className="adm-gate">
      <div className="adm-gate-card">
        <div className="ws-brand"><WsIcon name="square-equal" /><span>Cohort admin</span></div>
        {children}
      </div>
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [msg, setMsg] = useState('');
  const send = async (e) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setState('error'); setMsg('Enter a valid email address.'); return; }
    setState('sending');
    const { error } = await supabase.auth.signInWithOtp({ email: v, options: { emailRedirectTo: location.origin + '/admin' } });
    if (error) { setState('error'); setMsg(errText(error)); } else setState('sent');
  };
  if (state === 'sent') {
    return (
      <Gate>
        <h1>Check your email</h1>
        <p>We sent a sign-in link to <strong>{email.trim().toLowerCase()}</strong>. Open it on this device to continue.</p>
        <button type="button" className="adm-link" onClick={() => setState('idle')}>Use a different email</button>
      </Gate>
    );
  }
  return (
    <Gate>
      <h1>Sign in to edit</h1>
      <p>Only admins can sign in. You’ll get a one-time link by email.</p>
      <form onSubmit={send} noValidate className="adm-gate-form">
        <label htmlFor="adm-email">Email</label>
        <input id="adm-email" className="adm-input" type="email" autoComplete="email" autoFocus value={email}
          aria-invalid={state === 'error' || undefined} onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }} />
        {state === 'error' && <p className="adm-hint err" role="alert">{msg}</p>}
        <button type="submit" className="ws-btn primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send sign-in link'}</button>
      </form>
      <a className="adm-link" href="/">Back to the site</a>
    </Gate>
  );
}

/* ---------- Shell ---------- */
export default function Admin() {
  const [session, setSession] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(null);
  const [view, setView] = useState(() => {
    const h = location.hash.slice(1);
    return h === 'settings' || h === 'admins' || COLLECTIONS[h] ? h : 'sessions';
  });
  const [inspector, setInspector] = useState(null);
  const [railOpen, setRailOpen] = useState(false);
  const [toast, toasts] = useToasts();

  useEffect(() => {
    document.title = 'Admin · Cohort';
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  const email = session?.user?.email?.toLowerCase();
  useEffect(() => {
    if (!email) { setIsAdmin(null); return; }
    supabase.from('admins').select('email').eq('email', email).maybeSingle()
      .then(({ data, error }) => setIsAdmin(!error && !!data));
  }, [email]);
  useEffect(() => { history.replaceState(null, '', '/admin#' + view); setInspector(null); }, [view]);

  if (session === undefined || (session && isAdmin === null)) return <Gate><p>Loading…</p></Gate>;
  if (!session) return <SignIn />;
  if (!isAdmin) {
    return (
      <Gate>
        <h1>No edit access</h1>
        <p><strong>{email}</strong> isn’t on the admin list. Ask an admin to add you.</p>
        <button type="button" className="ws-btn" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </Gate>
    );
  }

  const cfg = COLLECTIONS[view];
  return (
    <div className="ws-app adm-app">
      <nav className={'ws-rail ws-left' + (railOpen ? ' open' : '')} aria-label="Admin">
        <div className="ws-rail-top">
          <div className="ws-brand"><WsIcon name="square-equal" /><span>Cohort admin</span></div>
          <div className="ws-groups">
            {NAV.map((g) => (
              <div className="ws-group" key={g.group} role="group" aria-label={g.group}>
                <span className="ws-group-label">{g.group}</span>
                {g.items.map(([k, label]) => (
                  <button key={k} type="button" className={'ws-link' + (view === k ? ' on' : '')} aria-current={view === k ? 'page' : undefined}
                    onClick={() => { setView(k); setRailOpen(false); }}>
                    <span className="ws-link-text">{label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="ws-rail-foot">
          <ul className="ws-meta"><li><WsIcon name="type" /><span title={email}>{email}</span></li></ul>
          <div className="adm-foot">
            <a className="adm-link" href="/" target="_blank" rel="noreferrer">View site</a>
            <button type="button" className="adm-link" onClick={() => supabase.auth.signOut()}>Sign out</button>
          </div>
        </div>
      </nav>

      <main className="ws-center">
        <header className="ws-top">
          <div className="ws-top-left">
            <button type="button" className="ws-menu" aria-label="Open navigation" onClick={() => setRailOpen(true)}><WsIcon name="square-equal" /></button>
            <ol className="ws-crumbs" aria-label="Breadcrumb"><li><span>Admin</span></li><li><span className="ws-sep" aria-hidden="true">/</span><span aria-current="page">{cfg ? cfg.label : view === 'settings' ? 'Settings' : 'Admins'}</span></li></ol>
          </div>
        </header>
        <div className="ws-col">
          {view === 'settings' && <Settings toast={toast} />}
          {view === 'admins' && <Admins toast={toast} me={email} />}
          {cfg && <Collection key={view} cfg={cfg} toast={toast} setInspector={setInspector} />}
        </div>
      </main>

      <aside className={'ws-rail ws-right adm-inspector' + (inspector ? ' open' : '')} aria-label="Editor">
        <div className="ws-rail-top ws-inspector">
          {inspector || (
            <div className="adm-idle">
              <p>{cfg ? `Pick a ${cfg.one} to edit it, or add a new one.` : 'Changes save straight to the live site.'}</p>
            </div>
          )}
        </div>
      </aside>
      {(railOpen || inspector) && <div className={'ws-scrim' + (railOpen ? ' for-left' : ' for-right')} aria-hidden="true" onClick={() => { setRailOpen(false); window.dispatchEvent(new Event('adm-close-editor')); }} />}
      {toasts}
    </div>
  );
}
