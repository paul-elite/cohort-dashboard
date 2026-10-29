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
        <span className="sp-count">Fixation {step + 1} of {marks.length}</span>
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
  const [size, setSize] = useState(18);
  const [measure, setMeasure] = useState(66);
  const [lead, setLead] = useState(1.55);
  const [grid, setGrid] = useState(false);
  const [fit, setFit] = useState(66);
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

  const reset = () => { setSerif(false); setSize(18); setMeasure(66); setLead(1.55); };

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
        <div
          className="sp-sample-wrap"
          style={{ fontSize: size, lineHeight: lead, maxWidth: measure + 'ch', '--lh': `${size * lead}px` }}
        >
          <p className="sp-sample" ref={sampleRef} style={{ fontFamily: serif ? "Georgia, 'Times New Roman', serif" : undefined }}>
            {sample}
          </p>
          {grid && <span className="sp-gridlines" aria-hidden="true" />}
        </div>
        <p className="sp-readout">
          <span>≈ {fit} characters · 45–75 recommended</span>
          <span>{perLine} words a line · {words} words</span>
          <button type="button" className="sp-grid-toggle" aria-pressed={grid} onClick={() => setGrid((g) => !g)}>
            <span className="sp-grid-swatch" aria-hidden="true" />
            Baseline grid
          </button>
        </p>
        {grid && (
          <p className="sp-caption">
            One line height, repeated. On the web the line box is measured mid-line, so the grid sits between the lines —
            and every heading leading and margin should be a multiple of it.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Same size, different presence (Chapter 2) ---------- */
function Specimen({ specimen }) {
  const [heights, setHeights] = useState({});
  const faces = specimen.faces;

  useEffect(() => {
    let alive = true;
    const measure = () => {
      const ctx = document.createElement('canvas').getContext('2d');
      const next = {};
      faces.forEach((f) => {
        ctx.font = `100px ${f.stack}`;
        const m = ctx.measureText('x');
        next[f.name] = +((m.actualBoundingBoxAscent / 100) * 17).toFixed(1);
      });
      if (alive) setHeights(next);
    };
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
    return () => { alive = false; };
  }, [faces]);

  return (
    <div className="sp-specimen">
      <div className="sp-faces">
        {faces.map((f) => (
          <figure className="sp-face" key={f.name}>
            <figcaption className="sp-face-top">
              <span className="sp-face-name">{f.name}</span>
              <span className="sp-face-kind">{f.kind}</span>
            </figcaption>
            <p className="sp-face-text" style={{ fontFamily: f.stack }}>{specimen.sample}</p>
            <p className="sp-face-foot mono">{heights[f.name] ? `x-height ${heights[f.name]}px` : 'x-height —'}</p>
            <p className="sp-face-note">{f.note}</p>
          </figure>
        ))}
      </div>
      <p className="sp-caption">{specimen.caption}</p>
    </div>
  );
}

/* ---------- Left or justified (Chapter 6) ---------- */
function JustifyDemo({ demo }) {
  const [justify, setJustify] = useState(false);
  return (
    <div className="sp-justify">
      <div className="sp-justify-head">
        <span className="sp-justify-label">Alignment</span>
        <div className="sp-seg" role="group" aria-label="Text alignment">
          <button type="button" aria-pressed={!justify} onClick={() => setJustify(false)}>Left</button>
          <button type="button" aria-pressed={justify} onClick={() => setJustify(true)}>Justify</button>
        </div>
      </div>
      <p className="sp-justify-text" style={{ textAlign: justify ? 'justify' : 'left' }}>{demo.text}</p>
      <p className="sp-caption">{justify ? demo.justified : demo.left}</p>
    </div>
  );
}

/* ---------- The modular scale (Chapters 7 and 9) ---------- */
function ScaleRamp({ scale }) {
  return (
    <div className="sp-scale">
      <div className="sp-scale-head">
        <span className="sp-scale-ratio">{scale.ratio}</span>
        <span className="sp-scale-formula mono">{scale.formula}</span>
      </div>
      <ol className="sp-scale-list">
        {scale.steps.map((step) => (
          <li key={step.px}>
            <span className="sp-scale-sample" style={{ fontSize: `${step.px}px` }}>Aa</span>
            <span className="sp-scale-role">{step.role}</span>
            <span className="sp-scale-px mono">{step.px}px</span>
          </li>
        ))}
      </ol>
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

        {page.source && <p className="sp-source">{page.source}</p>}
      </header>

      <section className="sp-sec" aria-labelledby="sp-sec-1">
        <div className="sp-sec-head">
          <span className="sp-num">01</span>
          <h2 id="sp-sec-1">The eye doesn&rsquo;t glide</h2>
          <span className="sp-chapter">Ch. 4</span>
        </div>
        <p className="sp-lede">{page.intro}</p>
        <Saccade text={page.saccade} />
      </section>

      <section className="sp-sec" aria-labelledby="sp-sec-2">
        <div className="sp-sec-head">
          <span className="sp-num">02</span>
          <h2 id="sp-sec-2">The equilateral triangle</h2>
          <span className="sp-chapter">Ch. 4</span>
        </div>
        <p className="sp-lede">{page.labIntro}</p>
        {page.quote && (
          <blockquote className="sp-quote">
            <p>{page.quote.text}</p>
            <cite>{page.quote.cite}</cite>
          </blockquote>
        )}
        <ReadingLab sample={page.excerpt} />
      </section>

      <section className="sp-sec" aria-labelledby="sp-sec-3">
        <div className="sp-sec-head">
          <span className="sp-num">03</span>
          <h2 id="sp-sec-3">Same size, different presence</h2>
          <span className="sp-chapter">Ch. 2</span>
        </div>
        <p className="sp-lede">{page.specimen.lede}</p>
        <Specimen specimen={page.specimen} />
        <div className="sp-pair">
          {page.specimen.points.map((point) => (
            <div key={point.title}>
              <h4>{point.title}</h4>
              <p>{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sp-sec" aria-labelledby="sp-sec-4">
        <div className="sp-sec-head">
          <span className="sp-num">04</span>
          <h2 id="sp-sec-4">Rhythm is horizontal and vertical</h2>
          <span className="sp-chapter">Ch. 6</span>
        </div>
        <p className="sp-lede">{page.rhythm.lede}</p>
        <div className="sp-rhythm">
          {page.rhythm.columns.map((col) => (
            <div className="sp-rhythm-col" key={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <JustifyDemo demo={page.rhythm.demo} />
      </section>

      <section className="sp-sec" aria-labelledby="sp-sec-5">
        <div className="sp-sec-head">
          <span className="sp-num">05</span>
          <h2 id="sp-sec-5">Sizes come from a scale</h2>
          <span className="sp-chapter">Ch. 7 &amp; 9</span>
        </div>
        <p className="sp-lede">{page.scale.lede}</p>
        <ScaleRamp scale={page.scale} />
        <div className="sp-pair">
          {page.scale.notes.map((note) => (
            <div key={note.title}>
              <h4>{note.title}</h4>
              <p>{note.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sp-sec" aria-labelledby="sp-sec-6">
        <div className="sp-sec-head">
          <span className="sp-num">06</span>
          <h2 id="sp-sec-6">Five rules to keep</h2>
        </div>
        <ol className="sp-notes">
          {page.notes.map((note, i) => (
            <li key={note.title}>
              <span className="sp-num" aria-hidden="true">{pad(i + 1)}</span>
              <div>
                <h3>
                  {note.title}
                  {note.chapter && <span className="sp-note-ch">{note.chapter}</span>}
                </h3>
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
