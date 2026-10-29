import { useEffect, useMemo, useState } from 'react';
import glyphGroups from './glyphs.json';
import './type-anatomy.css';

const FACES = [
  { name: 'Inter', stack: "'Inter', sans-serif", kind: 'Sans serif' },
  { name: 'Georgia', stack: "Georgia, 'Times New Roman', serif", kind: 'Serif' },
  { name: 'Geist Mono', stack: "'Geist Mono', monospace", kind: 'Monospace' },
];
const STYLES = [
  { name: 'Regular', weight: 400, style: 'normal' },
  { name: 'Medium', weight: 500, style: 'normal' },
];
const SERIF_STYLES = [STYLES[0], { name: 'Bold', weight: 700, style: 'normal' }];
const hex = (code) => code.toString(16).toUpperCase().padStart(4, '0');
const INITIAL = glyphGroups[0].glyphs.find((glyph) => glyph.char === 'A');

function useMetrics(face, style, char) {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => {
    let active = true;
    const measure = () => {
      if (!active) return;
      const context = document.createElement('canvas').getContext('2d');
      if (!context) return;
      context.font = `${style.style} ${style.weight} 1000px ${face.stack}`;
      const ink = (text) => context.measureText(text);
      const glyph = ink(char);
      setMetrics({
        ascender: ink('h').actualBoundingBoxAscent,
        cap: ink('H').actualBoundingBoxAscent,
        x: ink('x').actualBoundingBoxAscent,
        descender: ink('p').actualBoundingBoxDescent,
        top: Math.max(ink('ÅÉ').actualBoundingBoxAscent, glyph.actualBoundingBoxAscent),
        bottom: Math.max(ink('gjpq').actualBoundingBoxDescent, glyph.actualBoundingBoxDescent),
        width: glyph.actualBoundingBoxLeft + glyph.actualBoundingBoxRight,
        left: glyph.actualBoundingBoxLeft,
        right: glyph.actualBoundingBoxRight,
      });
    };
    measure();
    if (document.fonts) {
      document.fonts.load(`${style.weight} 16px ${face.stack}`).then(measure).catch(() => {});
      document.fonts.addEventListener('loadingdone', measure);
    }
    return () => { active = false; document.fonts?.removeEventListener('loadingdone', measure); };
  }, [face, style, char]);
  return metrics;
}

function Specimen({ glyph, face, style, metrics, guides }) {
  const scale = metrics ? Math.min(0.31, 300 / Math.max(1, metrics.top + metrics.bottom), 350 / Math.max(1, metrics.width)) : .3;
  const baseline = metrics ? 64 + metrics.top * scale : 340;
  const lines = metrics ? [
    ['Ascender · h', metrics.ascender], ['Cap height · H', metrics.cap],
    ['x-height · x', metrics.x], ['Baseline', 0], ['Descender · p', -metrics.descender],
  ] : [];
  // Some fonts share cap and ascender heights: combine those labels instead of overlapping them.
  const merged = [];
  for (const [label, value] of lines) {
    const same = merged.find((line) => Math.abs(line.value - value) * scale < 20);
    if (same) same.label += ` / ${label}`;
    else merged.push({ label, value });
  }
  const originX = metrics ? 220 + (metrics.left - metrics.right) * scale / 2 : 220;
  return <svg className="ta-specimen" viewBox="0 0 440 420" role="img" aria-label={`${glyph.name}, ${face.name} ${style.name}${guides ? ', with measured type guides' : ''}`}>
    {guides && merged.map(({ label, value }) => <g key={label} className={value === 0 ? 'ta-guide baseline' : 'ta-guide'}>
      <line x1="0" x2="440" y1={baseline - value * scale} y2={baseline - value * scale} />
      <text x="0" y={baseline - value * scale - 9}>{label}</text>
      <text x="440" y={baseline - value * scale - 9} textAnchor="end">{Math.round(value)}</text>
    </g>)}
    <text className="ta-letter" x={originX} y={baseline} style={{ fontFamily: face.stack, fontWeight: style.weight, fontStyle: style.style, fontSize: 1000 * scale }}>{glyph.char}</text>
    {(glyph.code === 32 || glyph.code === 160) && <text className="ta-space" x="220" y="210" textAnchor="middle">Space character</text>}
  </svg>;
}

export default function TypeAnatomy({ query = '' }) {
  const [faceIndex, setFaceIndex] = useState(0);
  const [styleIndex, setStyleIndex] = useState(0);
  const [selected, setSelected] = useState(INITIAL);
  const [guides, setGuides] = useState(true);
  const face = FACES[faceIndex];
  const styles = face.name === 'Georgia' ? SERIF_STYLES : STYLES;
  const style = styles[styleIndex];
  const metrics = useMetrics(face, style, selected.char);
  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    return glyphGroups.map((group) => ({ ...group, glyphs: group.glyphs.filter((g) => !term || (Array.from(term).length === 1 ? g.char.toLowerCase() === term : g.name.toLowerCase().includes(term) || `u+${hex(g.code)}`.toLowerCase().includes(term))) })).filter((group) => group.glyphs.length);
  }, [query]);
  const count = groups.reduce((total, group) => total + group.glyphs.length, 0);

  return <section className="ta-page" aria-label="Interactive type anatomy">
    <div className="ta-intro">
      <p>Explore the shapes behind the letters. Choose a character to inspect its proportions and Unicode details.</p>
      <span className="ta-total mono">{count} {count === 1 ? 'glyph' : 'glyphs'}</span>
    </div>
    <div className="ta-workspace">
      <aside className="ta-inspector" aria-label="Selected glyph">
        <div className="ta-inspector-top"><span className="eyebrow">Glyph inspector</span><label className="ta-guides-toggle"><input type="checkbox" checked={guides} onChange={(event) => setGuides(event.target.checked)} /> Guides</label></div>
        <Specimen glyph={selected} face={face} style={style} metrics={metrics} guides={guides} />
        <div className="ta-select-row"><label htmlFor="ta-typeface">Typeface</label><select id="ta-typeface" value={faceIndex} onChange={(e) => setFaceIndex(Number(e.target.value))}>{FACES.map((f, i) => <option key={f.name} value={i}>{f.name}</option>)}</select></div>
        <div className="ta-select-row"><label htmlFor="ta-style">Font style</label><select id="ta-style" value={styleIndex} onChange={(e) => setStyleIndex(Number(e.target.value))}>{styles.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}</select></div>
        <dl className="ta-details" aria-live="polite" aria-atomic="true">
          <div><dt>Glyph</dt><dd>{selected.code === 32 || selected.code === 160 ? 'Space' : selected.char}</dd></div>
          <div><dt>Unicode name</dt><dd className="ta-unicode-name">{selected.name.toLowerCase()}</dd></div>
          <div><dt>Unicode decimal</dt><dd className="mono">{selected.code}</dd></div>
          <div><dt>Unicode hex</dt><dd className="mono">U+{hex(selected.code)}</dd></div>
        </dl>
        <p className="ta-metric-note">Guides measure the rendered h, H, x and p at 1,000 px. They show visible letter bounds, not the font’s internal metrics.</p>
      </aside>
      <div className="ta-library" style={{ '--ta-font': face.stack, '--ta-weight': style.weight }}>
        <div className="ta-library-top"><span className="eyebrow">Character set</span><span>{face.name} <span aria-hidden="true">/</span> {style.name}</span></div>
        {groups.map((group) => <section key={group.name} className="ta-group" aria-label={group.name}>
          <h2>{group.name}<span className="mono">{group.glyphs.length}</span></h2>
          <div className="ta-glyphs">
            {group.glyphs.map((glyph) => <button type="button" key={glyph.code} className="ta-glyph" aria-pressed={selected.code === glyph.code} aria-label={`${glyph.name}, U+${hex(glyph.code)}`} title={`${glyph.name} · U+${hex(glyph.code)}`} onClick={() => setSelected(glyph)}>
              <span aria-hidden="true">{glyph.code === 32 || glyph.code === 160 ? '␣' : glyph.char}</span>
            </button>)}
          </div>
        </section>)}
        {!count && <div className="ta-empty"><h2>No matching glyphs</h2><p>Try a letter, a Unicode name such as “capital”, or a code such as “U+0041”.</p></div>}
      </div>
    </div>
  </section>;
}
