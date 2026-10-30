import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import './input-playground.css';
import { EXTRA_COMPONENTS, ExtraDemo } from './PlaygroundComponents.jsx';

export const INPUT_DEFAULTS = { disabled: false, errors: false, hints: true, dark: false, radius: 10, width: 402, reset: 0 };
export function InputControls({ settings, onChange, type }) {
  const update = (key, value) => onChange(current => ({ ...current, [key]: value }));
  return <aside className="ip-controls" aria-label="Input playground controls">
    <div className="panel-top"><span className="eyebrow">Edit component</span></div>
    {!['Segmented Control', 'Icon Buttons'].includes(type) && <label className="ip-edit-label">Display label<input value={settings.label || ''} placeholder="Default label" onChange={e => update('label', e.target.value)} /></label>}
    {['Search', 'Text Inputs', 'Textarea', 'Number field', 'Phone field', 'URL field', 'Autocomplete', 'Verification code', 'Password strength', 'Tag input', 'Command palette', 'Inline validation'].includes(type) && <label className="ip-edit-label">Placeholder<input value={settings.placeholder || ''} placeholder="Default placeholder" onChange={e => update('placeholder', e.target.value)} /></label>}
    <p>Try the inputs, then adjust their appearance and states.</p>
    {['disabled', 'errors', 'hints', 'dark'].map((key, i) => <label className="ip-setting" key={key}><span>{['Disable inputs', 'Show errors', 'Show helper text', 'Dark preview'][i]}</span><input type="checkbox" checked={settings[key]} onChange={e => update(key, e.target.checked)} /></label>)}
    <label className="ip-setting-range">Corner radius <output>{settings.radius}px</output><input type="range" min="0" max="20" value={settings.radius} onChange={e => update('radius', Number(e.target.value))} /></label>
    <label className="ip-setting-range">Preview width <output>{settings.width}px</output><input type="range" min="320" max="560" step="2" value={settings.width} onChange={e => update('width', Number(e.target.value))} /></label>
    <button className="btn" type="button" onClick={() => onChange(current => ({ ...INPUT_DEFAULTS, reset: current.reset + 1 }))}>Reset playground</button>
    <p className="ip-note">A local demo: input values and button actions stay in this preview.</p>
  </aside>;
}
const PreviewType = createContext(null);
function Section({ title, children }) { const type = useContext(PreviewType); if (type && type !== title) return null; return <section className="ip-section"><h3>{title}</h3>{children}</section>; }
function LegacyDemo({ settings, onChange, type }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [radio, setRadio] = useState('');
  const [segment, setSegment] = useState('Strict');
  const [notifications, setNotifications] = useState(false);
  const [message, setMessage] = useState('');
  const [count, setCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const emailError = settings.errors || (submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const passwordError = settings.errors || (submitted && password.length < 8);
  const action = () => { if (type === 'Buttons') { setMessage('Primary action clicked.'); return; } setSubmitted(true); setMessage(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 8 && !settings.errors ? 'Demo submitted successfully.' : 'Check the highlighted fields.'); };
  return <PreviewType.Provider value={type}><div className="ip-stage"><div className={'ip-preview' + (settings.dark ? ' ip-dark' : '')} style={{ '--ip-radius': `${settings.radius}px`, width: settings.width }}>

    <fieldset disabled={settings.disabled} className="ip-fields">
      <Section title="Search"><div className="ip-search"><img src="/inputs/search.svg" alt="" /><input aria-label="Demo search" placeholder={settings.placeholder || settings.label || "Search"} type="search" onChange={e => setMessage(e.target.value ? `Search preview: ${e.target.value}` : '')} /><kbd>/</kbd></div></Section>
      <Section title="Text Inputs">{[['Email', email, setEmail, emailError, 'user@example.com', 'Enter your email address', 'Enter a valid email address.'], ['Password', password, setPassword, passwordError, '••••••••', 'Must be at least 8 characters', 'Use at least 8 characters.']].map(([label, value, setter, error, placeholder, hint, errorText]) => <div className="ip-field" key={label}><label htmlFor={`${id}-${label}`}>{(label === 'Email' && settings.label) || label}</label><input id={`${id}-${label}`} type={label === 'Email' ? 'email' : 'password'} value={value} placeholder={(label === 'Email' && settings.placeholder) || placeholder} onChange={e => setter(e.target.value)} aria-invalid={error} aria-describedby={error || settings.hints ? `${id}-hint-${label}` : undefined} />{(error || settings.hints) && <p id={`${id}-hint-${label}`} className={error ? 'ip-error' : ''}>{error ? errorText : hint}</p>}</div>)}</Section>
      <Section title="Checkboxes">{[['Subscribe to newsletter', "We’ll never share your details."], ['I agree to the terms', 'Required to proceed.']].map(([label, hint]) => <label className="ip-choice" key={label}><input type="checkbox" /><span>{settings.label || label}{settings.hints && <small>{hint}</small>}</span></label>)}</Section>
      <Section title="Radio Buttons">{['Option 1', 'Option 2'].map((label, i) => <label className="ip-choice" key={label}><input type="radio" name={`${id}-option`} checked={radio === label} onChange={() => setRadio(label)} /><span>{settings.label || label}{settings.hints && <small>{i === 0 ? 'Default choice' : 'Alternative choice'}</small>}</span></label>)}</Section>
      <Section title="Segmented Control"><div className="ip-segment" role="group" aria-label="Rule mode">{['Strict', 'Balanced', 'Flexible'].map(label => <button type="button" key={label} aria-pressed={segment === label} onClick={() => setSegment(label)}>{label}</button>)}</div></Section>
      <Section title="Switches">{[['Enable notifications', notifications, () => setNotifications(!notifications)], ['Dark mode', settings.dark, () => onChange(current => ({ ...current, dark: !current.dark }))]].map(([label, on, toggle]) => <div className="ip-switch-row" key={label}><span>{settings.label || label}</span><button type="button" className="ip-switch" role="switch" aria-label={label} aria-checked={on} onClick={toggle}>{on ? <span className="ip-switch-on"><span /></span> : <img src="/inputs/switch-off.svg" alt="" />}</button></div>)}</Section>
      <Section title="Buttons"><button type="button" className="ip-button ip-primary" onClick={action}>{settings.label || 'Primary Action'}</button><button type="button" className="ip-button" onClick={() => { setSubmitted(false); setMessage('Secondary action clicked.'); }}>Secondary Action</button></Section>
      <Section title="Icon Buttons"><div className="ip-icon-row">{['Add item', 'Add another item'].map(label => <button type="button" className="ip-icon-button" key={label} aria-label={label} onClick={() => { setCount(count + 1); setMessage(`${count + 1} demo items added.`); }}><img src="/inputs/plus.svg" alt="" /></button>)}</div></Section>
    </fieldset>
    <p className="ip-feedback" role="status">{message}</p>
  </div></div></PreviewType.Provider>;
}


const ORIGINAL_COMPONENTS = [
  { name: 'Search', category: 'Fields' }, { name: 'Text Inputs', category: 'Fields' },
  { name: 'Checkboxes', category: 'Fields' }, { name: 'Radio Buttons', category: 'Fields' },
  { name: 'Segmented Control', category: 'Navigation' }, { name: 'Switches', category: 'Fields' },
  { name: 'Buttons', category: 'Actions' }, { name: 'Icon Buttons', category: 'Actions' },
];
const COMPONENTS = [...ORIGINAL_COMPONENTS, ...EXTRA_COMPONENTS];
function InputDemo(props) {
  return EXTRA_COMPONENTS.some(item => item.name === props.type) ? <ExtraDemo {...props} /> : <LegacyDemo {...props} />;
}

function InputEditor({ type, settings, onChange, onClose }) {
  const ref = useRef(null);
  const closing = useRef(false);
  const closeTimer = useRef(null);
  const requestClose = () => {
    if (closing.current) return;
    closing.current = true;
    const dialog = ref.current;
    dialog.dataset.motion = 'closed';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onClose(); return; }
    // Keep the native modal and focus trap alive until the exit completes.
    closeTimer.current = window.setTimeout(onClose, 200);
  };
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    dialog.dataset.motion = 'closed';
    // Establish the initial style before transitioning, including on older browsers.
    dialog.getBoundingClientRect();
    const frame = requestAnimationFrame(() => { if (!closing.current) dialog.dataset.motion = 'open'; });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(closeTimer.current);
      dialog.close();
      previous?.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} className="ip-dialog" aria-labelledby="ip-editor-title" onCancel={e => { e.preventDefault(); requestClose(); }} onClick={e => { if (e.target === ref.current) { const r = ref.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) requestClose(); } }}>
    <header className="ip-dialog-header"><div><span className="eyebrow">Input playground</span><h2 id="ip-editor-title">{type}</h2></div><button type="button" className="ip-close" aria-label="Close editor" onClick={requestClose}>×</button></header>
    <div className="ip-editor-body"><div className="ip-editor-preview"><InputDemo key={settings.reset} type={type} settings={settings} onChange={onChange} /></div><InputControls type={type} settings={settings} onChange={onChange} /></div>
    <footer className="ip-dialog-footer"><span>Changes appear in the grid.</span><button type="button" className="ip-button" onClick={requestClose}>Done</button></footer>
  </dialog>;
}
export default function InputPlayground({ query = '' }) {
  const [selected, setSelected] = useState(null);
  const [configs, setConfigs] = useState({});
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [editedOnly, setEditedOnly] = useState(false);
  const [sort, setSort] = useState('grouped');
  const settingsFor = type => configs[type] || INPUT_DEFAULTS;
  const update = type => action => setConfigs(current => ({ ...current, [type]: typeof action === 'function' ? action(current[type] || INPUT_DEFAULTS) : action }));
  const matching = COMPONENTS.filter(item => [search, query].every(term => `${item.name} ${item.category}`.toLowerCase().includes(term.trim().toLowerCase())) && (!editedOnly || configs[item.name]));
  const filtered = matching.filter(item => category === 'All' || item.category === category);
  const types = (sort === 'az' ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : filtered).map(item => item.name);
  const clearFilters = () => { setSearch(''); setCategory('All'); setEditedOnly(false); setSort('grouped'); };
  return <section className="ip-gallery" aria-label="Input component gallery">
    <p className="ip-gallery-intro">Explore {COMPONENTS.length} components. Choose one to try it out and edit its appearance.</p>
    <div className="pc-filters">
      <div className="pc-filter-row"><label className="pc-search-label"><span className="sr-only">Find components</span><input type="search" placeholder="Find components…" value={search} onChange={e => setSearch(e.target.value)} /></label><label className="pc-sort">Sort<select value={sort} onChange={e => setSort(e.target.value)}><option value="grouped">Library order</option><option value="az">Name A–Z</option></select></label></div>
      <div className="pc-categories" role="group" aria-label="Component categories">{['All', 'Fields', 'Actions', 'Navigation', 'Feedback', 'Display'].map(group => <button type="button" key={group} aria-pressed={category === group} onClick={() => setCategory(group)}>{group}<span>{matching.filter(item => group === 'All' || item.category === group).length}</span></button>)}</div>
      <div className="pc-filter-row"><span role="status">{types.length} of {COMPONENTS.length} components</span><label className="pc-edited"><input type="checkbox" checked={editedOnly} onChange={e => setEditedOnly(e.target.checked)} />Edited only</label>{(search || category !== 'All' || editedOnly || sort !== 'grouped') && <button type="button" className="pc-clear" onClick={clearFilters}>Clear filters</button>}</div>
    </div>
    <div className="ip-grid">{types.map(type => <article className="ip-card" key={type}>
      <div className="ip-card-preview" inert="" aria-hidden="true"><InputDemo key={settingsFor(type).reset} type={type} settings={settingsFor(type)} onChange={update(type)} /></div>
      <div className="ip-card-caption"><div><h2>{type}</h2><small>{COMPONENTS.find(item => item.name === type).category}</small></div><span aria-hidden="true">↗</span></div>
      <button type="button" className="ip-card-open" aria-label={`Edit ${type}`} onClick={() => setSelected(type)} />
    </article>)}</div>
    {!types.length && <p>No matching components. Try another category or clear your search and filters.</p>}
    {selected && <InputEditor type={selected} settings={settingsFor(selected)} onChange={update(selected)} onClose={() => setSelected(null)} />}
  </section>;
}
