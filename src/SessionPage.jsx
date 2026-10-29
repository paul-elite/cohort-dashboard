import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon, ArrowRight01Icon, PauseIcon, PlayIcon, ReloadIcon,
} from '@hugeicons/core-free-icons';
import { COHORT, SESSION_PAGES, SESSIONS } from './data.js';
import CoverArt from './CoverArt.jsx';

const fromKey = (k) => new Date(k + 'T12:00:00');
const pad = (n) => String(n).padStart(2, '0');
const dateLine = (k) => fromKey(k).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const SESSION_KEYS = Object.keys(SESSIONS).sort();

function Icon({ icon, size = 20, bold = false, ...rest }) {
  return <HugeiconsIcon icon={icon} size={size} color="currentColor" strokeWidth={bold ? 2 : 1} absoluteStrokeWidth={!bold} aria-hidden="true" focusable="false" {...rest} />;
}

/* ---------- The eye, in stops and starts ---------- */
function Saccade({ text }) {
  const words = useMemo(() => text.split(' '), [text]);
  const marks = useMemo(() => words.reduce((acc, _, i) => (i % 3 === 0 ? [...acc, i] : acc), []), [words]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setStep((s) => (s + 1) % marks.length), 720);
    return () => clearInterval(id);
  }, [playing, marks.length]);

  const active = marks[step];
  return (
    <div className="sp-saccade">
      <p className="sp-saccade-text">
        {words.map((w, i) => (
          <span key={i}>
            <span className={i === active ? 'on' : undefined}>{w}</span>{i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
      <div className="sp-saccade-foot">
        <span className="sp-count">Fixation {step + 1} of {marks.length} · ~230ms</span>
        <span className="sp-dots" aria-hidden="true">
          {marks.map((_, i) => <i key={i} className={i <= step ? 'on' : undefined} />)}
        </span>
        <button type="button" className="sp-btn" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
          <Icon icon={playing ? PauseIcon : PlayIcon} size={15} bold={playing} />
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="sp-btn icon" aria-label="Restart" onClick={() => { setPlaying(false); setStep(0); }}>
          <Icon icon={ReloadIcon} size={15} />
        </button>
      </div>
    </div>
  );
}

/* ---------- The reading lab ---------- */
function ReadingLab({ sample }) {
  const [serif, setSerif] = useState(false);
  const [size, setSize] = useState(17);
  const [measure, setMeasure] = useState(62);
  const [lead, setLead] = useState(1.55);
  const [fit, setFit] = useState(62);
  const sampleRef = useRef(null);

  // How many characters really fit on a line: the requested measure, or the
  // width of the page when that is narrower. Keeps the readout honest.
  useLayoutEffect(() => {
    const el = sampleRef.current;
    if (!el) return undefined;
    const calc = () => {
      const probe = document.createElement('span');
      probe.textContent = '0'.repeat(40);
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;';
      el.appendChild(probe);
      const ch = probe.getBoundingClientRect().width / 40;
      probe.remove();
      if (ch > 0) setFit(Math.floor(el.getBoundingClientRect().width / ch));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size, serif, sample]);

  const words = sample.trim().split(/\s+/).length;
  const perLine = Math.max(4, Math.round(fit / 5.6));
  const minutes = Math.max(1, Math.round(words / 200));

  const reset = () => { setSerif(false); setSize(17); setMeasure(62); setLead(1.55); };

  return (
    <div className="sp-lab">
      <div className="sp-controls">
        <div className="sp-field">
          <span className="sp-field-top"><label id="lab-face">Typeface</label></span>
          <div className="sp-seg" role="group" aria-labelledby="lab-face">
            <button type="button" aria-pressed={!serif} onClick={() => setSerif(false)}>Sans</button>
            <button type="button" aria-pressed={serif} onClick={() => setSerif(true)}>Serif</button>
          </div>
        </div>
        <div className="sp-field">
          <span className="sp-field-top"><label htmlFor="lab-size">Size</label><output htmlFor="lab-size">{size}px</output></span>
          <input id="lab-size" className="sp-range" type="range" min="14" max="26" step="1" value={size} onChange={(e) => setSize(+e.target.value)} />
        </div>
        <div className="sp-field">
          <span className="sp-field-top"><label htmlFor="lab-measure">Measure</label><output htmlFor="lab-measure">{measure}ch</output></span>
          <input id="lab-measure" className="sp-range" type="range" min="34" max="96" step="2" value={measure} onChange={(e) => setMeasure(+e.target.value)} />
        </div>
        <div className="sp-field">
          <span className="sp-field-top"><label htmlFor="lab-lead">Leading</label><output htmlFor="lab-lead">{lead.toFixed(2)}</output></span>
          <input id="lab-lead" className="sp-range" type="range" min="1.1" max="2.1" step="0.05" value={lead} onChange={(e) => setLead(+e.target.value)} />
        </div>
        <button type="button" className="sp-reset" onClick={reset}><Icon icon={ReloadIcon} size={14} />Reset</button>
      </div>

      <div className="sp-lab-page">
        <p
          className="sp-sample"
          ref={sampleRef}
          style={{
            fontFamily: serif ? "Georgia, 'Times New Roman', serif" : undefined,
            fontSize: size,
            lineHeight: lead,
            maxWidth: measure + 'ch',
          }}
        >
          {sample}
        </p>
        <p className="sp-readout">
          <span>≈ {fit} characters · {perLine} words a line · {words} words</span>
          <span>{minutes} min at 200 wpm</span>
        </p>
      </div>
    </div>
  );
}

/* ---------- The session page ---------- */
export default function SessionPage({ dayKey, onOpenDay, onOpenSession, onBack }) {
  const page = SESSION_PAGES[dayKey];
  const s = SESSIONS[dayKey];
  const n = SESSION_KEYS.indexOf(dayKey) + 1;
  const nextKey = SESSION_KEYS.find((k) => k > dayKey);

  useEffect(() => {
    // Desktop scrolls .main, tablet scrolls .app, narrow screens the window.
    document.querySelector('.main')?.scrollTo?.({ top: 0 });
    document.querySelector('.app')?.scrollTo?.({ top: 0 });
    window.scrollTo?.({ top: 0 });
  }, [dayKey]);

  if (!page || !s) return null;

  return (
    <article className="sp">
      <header className="sp-head">
        <div className="sp-eyebrow-row">
          <span className="sp-eyebrow">Session {pad(n)} · {dateLine(dayKey)}</span>
          <button type="button" className="sp-details" onClick={() => onOpenDay(dayKey)}>
            Session details<Icon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>

        <div className="sp-hero">
          <div>
            <h1>{s.title}</h1>
            <p className="sp-dek">{page.dek}</p>
          </div>
          <div className="sp-plate" aria-hidden="true">
            <span className="sess-issue">Session {pad(n)}</span>
            <span className="sp-plate-art"><CoverArt kind="type" /></span>
            <span className="sp-plate-foot">{page.kicker}</span>
          </div>
        </div>

        <div className="sp-metarow">
          {s.tags.map((t) => <span key={t.label} className="sess-tag"><i style={{ background: t.color }} />{t.label}</span>)}
          <span className="sp-sep" aria-hidden="true" />
          <span>{s.time}</span>
          <span className="sp-sep" aria-hidden="true" />
          <span>{COHORT.name} Cohort #{COHORT.number}</span>
        </div>
      </header>

      <section className="sp-sec" aria-labelledby="sp-sec-1">
        <div className="sp-sec-head">
          <span className="sp-num">01</span>
          <h2 id="sp-sec-1">The eye doesn&rsquo;t glide</h2>
        </div>
        <p className="sp-lede">{page.intro}</p>
        <Saccade text={page.saccade} />
      </section>

      <section className="sp-sec" aria-labelledby="sp-sec-2">
        <div className="sp-sec-head">
          <span className="sp-num">02</span>
          <h2 id="sp-sec-2">Measure, leading, then typeface</h2>
        </div>
        <p className="sp-lede">{page.labIntro}</p>
        <ReadingLab sample={page.excerpt} />
      </section>

      <section className="sp-sec" aria-labelledby="sp-sec-3">
        <div className="sp-sec-head">
          <span className="sp-num">03</span>
          <h2 id="sp-sec-3">Three things to take away</h2>
        </div>
        <ol className="sp-notes">
          {page.notes.map((note, i) => (
            <li key={note.title}>
              <span className="sp-num" aria-hidden="true">{pad(i + 1)}</span>
              <div>
                <h3>{note.title}</h3>
                <p>{note.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="sp-foot">
        <button type="button" className="sp-back" onClick={onBack}>
          <Icon icon={ArrowLeft01Icon} size={16} />All sessions
        </button>
        {nextKey && (
          <button type="button" className="sp-next" onClick={() => onOpenSession(nextKey)}>
            <span className="sp-next-label">Next session</span>
            <span className="sp-next-title">{SESSIONS[nextKey].title}<Icon icon={ArrowRight01Icon} size={16} /></span>
            <span className="sp-next-date">Session {pad(SESSION_KEYS.indexOf(nextKey) + 1)} · {dateLine(nextKey)}</span>
          </button>
        )}
      </footer>
    </article>
  );
}
