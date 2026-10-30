import { useState } from 'react';
import './input-playground.css';

export const INPUT_DEFAULTS = { disabled: false, errors: false, hints: true, dark: false, radius: 10, width: 402, reset: 0 };
export function InputControls({ settings, onChange }) {
  const update = (key, value) => onChange(current => ({ ...current, [key]: value }));
  return <aside className="panel ip-controls" aria-label="Input playground controls">
    <div className="panel-top"><span className="eyebrow">Playground controls</span></div>
    <p>Try the inputs, then adjust their appearance and states.</p>
    {['disabled', 'errors', 'hints', 'dark'].map((key, i) => <label className="ip-setting" key={key}><span>{['Disable inputs', 'Show errors', 'Show helper text', 'Dark preview'][i]}</span><input type="checkbox" checked={settings[key]} onChange={e => update(key, e.target.checked)} /></label>)}
    <label className="ip-setting-range">Corner radius <output>{settings.radius}px</output><input type="range" min="0" max="20" value={settings.radius} onChange={e => update('radius', Number(e.target.value))} /></label>
    <label className="ip-setting-range">Preview width <output>{settings.width}px</output><input type="range" min="320" max="560" step="2" value={settings.width} onChange={e => update('width', Number(e.target.value))} /></label>
    <button className="btn" type="button" onClick={() => onChange(current => ({ ...INPUT_DEFAULTS, reset: current.reset + 1 }))}>Reset playground</button>
    <p className="ip-note">A local demo: input values and button actions stay in this preview.</p>
  </aside>;
}
function Section({ title, children }) { return <section className="ip-section"><h3>{title}</h3>{children}</section>; }
export default function InputPlayground({ settings, onChange }) {
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
  const action = () => { setSubmitted(true); setMessage(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 8 && !settings.errors ? 'Demo submitted successfully.' : 'Check the highlighted fields.'); };
  return <div className="ip-stage"><div className={'ip-preview' + (settings.dark ? ' ip-dark' : '')} style={{ '--ip-radius': `${settings.radius}px`, width: settings.width }}>
    <header><h2>Controls</h2><span className="ip-badge">Inputs</span></header>
    <fieldset disabled={settings.disabled} className="ip-fields">
      <Section title="Search"><div className="ip-search"><img src="/inputs/search.svg" alt="" /><input aria-label="Demo search" placeholder="Search" type="search" onChange={e => setMessage(e.target.value ? `Search preview: ${e.target.value}` : '')} /><kbd>/</kbd></div></Section>
      <Section title="Text Inputs">{[['Email', email, setEmail, emailError, 'user@example.com', 'Enter your email address', 'Enter a valid email address.'], ['Password', password, setPassword, passwordError, '••••••••', 'Must be at least 8 characters', 'Use at least 8 characters.']].map(([label, value, setter, error, placeholder, hint, errorText]) => <div className="ip-field" key={label}><label htmlFor={`demo-${label}`}>{label}</label><input id={`demo-${label}`} type={label === 'Email' ? 'email' : 'password'} value={value} placeholder={placeholder} onChange={e => setter(e.target.value)} aria-invalid={error} aria-describedby={error || settings.hints ? `hint-${label}` : undefined} />{(error || settings.hints) && <p id={`hint-${label}`} className={error ? 'ip-error' : ''}>{error ? errorText : hint}</p>}</div>)}</Section>
      <Section title="Checkboxes">{[['Subscribe to newsletter', "We’ll never share your details."], ['I agree to the terms', 'Required to proceed.']].map(([label, hint]) => <label className="ip-choice" key={label}><input type="checkbox" /><span>{label}{settings.hints && <small>{hint}</small>}</span></label>)}</Section>
      <Section title="Radio Buttons">{['Option 1', 'Option 2'].map((label, i) => <label className="ip-choice" key={label}><input type="radio" name="demo-option" checked={radio === label} onChange={() => setRadio(label)} /><span>{label}{settings.hints && <small>{i === 0 ? 'Default choice' : 'Alternative choice'}</small>}</span></label>)}</Section>
      <Section title="Segmented Control"><div className="ip-segment" role="group" aria-label="Rule mode">{['Strict', 'Balanced', 'Flexible'].map(label => <button type="button" key={label} aria-pressed={segment === label} onClick={() => setSegment(label)}>{label}</button>)}</div></Section>
      <Section title="Switches">{[['Enable notifications', notifications, () => setNotifications(!notifications)], ['Dark mode', settings.dark, () => onChange(current => ({ ...current, dark: !current.dark }))]].map(([label, on, toggle]) => <div className="ip-switch-row" key={label}><span>{label}</span><button type="button" className="ip-switch" role="switch" aria-label={label} aria-checked={on} onClick={toggle}>{on ? <span className="ip-switch-on"><span /></span> : <img src="/inputs/switch-off.svg" alt="" />}</button></div>)}</Section>
      <Section title="Buttons"><button type="button" className="ip-button ip-primary" onClick={action}>Primary Action</button><button type="button" className="ip-button" onClick={() => { setSubmitted(false); setMessage('Secondary action clicked.'); }}>Secondary Action</button></Section>
      <Section title="Icon Buttons"><div className="ip-icon-row">{['Add item', 'Add another item'].map(label => <button type="button" className="ip-icon-button" key={label} aria-label={label} onClick={() => { setCount(count + 1); setMessage(`${count + 1} demo items added.`); }}><img src="/inputs/plus.svg" alt="" /></button>)}</div></Section>
    </fieldset>
    <p className="ip-feedback" role="status">{message}</p>
  </div></div>;
}
