import { useEffect, useState } from 'react';
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
export const ANATOMY = [
  { name: 'Baseline', char: 'H', category: 'Proportions', description: 'The imaginary line on which most letters sit.', example: 'The bottoms of H and x rest on the baseline.' },
  { name: 'Cap height', char: 'H', category: 'Proportions', description: 'The height of flat-topped capital letters above the baseline.', example: 'H shows the cap height; round capitals may extend slightly beyond it.' },
  { name: 'x-height', char: 'x', category: 'Proportions', description: 'The height of the lowercase x, used to describe the main body of lowercase letters.', example: 'Compare x with h to see the difference between x-height and ascender height.' },
  { name: 'Ascender', char: 'h', category: 'Proportions', description: 'The part of a lowercase letter that rises above the x-height.', example: 'The tall stem of h is an ascender.' },
  { name: 'Descender', char: 'p', category: 'Proportions', description: 'The part of a letter that extends below the baseline.', example: 'The stem of p continues below the baseline.' },
  { name: 'Stem', char: 'H', category: 'Letterforms', description: 'A principal upright or diagonal stroke of a letter.', example: 'The two vertical strokes of H are stems.' },
  { name: 'Crossbar', char: 'A', category: 'Letterforms', description: 'A horizontal stroke joining two parts of a letter.', example: 'The horizontal stroke across A is its crossbar.' },
  { name: 'Bowl', char: 'b', category: 'Letterforms', description: 'A curved stroke that encloses a space within a letter.', example: 'The rounded part of b forms its bowl.' },
  { name: 'Counter', char: 'O', category: 'Letterforms', description: 'The enclosed or partially enclosed space inside a letter.', example: 'The open space inside O is its counter.' },
  { name: 'Aperture', char: 'c', category: 'Letterforms', description: 'The opening between the ends of an open letterform.', example: 'The gap on the right of c is its aperture.' },
  { name: 'Shoulder', char: 'n', category: 'Letterforms', description: 'A curved stroke that arches out from a stem.', example: 'The arch of n forms its shoulder.' },
  { name: 'Serif', char: 'I', category: 'Letterforms', description: 'A small finishing stroke at the end of a main stroke in a serif typeface.', example: 'In Georgia, I has serifs at the top and bottom. Sans serif faces omit them.' },
  { name: 'Terminal', char: 'a', category: 'Letterforms', description: 'The end of a stroke that does not finish in a serif.', example: 'The exposed stroke ending of a is a terminal; its shape varies by typeface.' },
  { name: 'Leg', char: 'R', category: 'Letterforms', description: 'A stroke that extends downward and away from the main body of a letter.', example: 'The diagonal lower stroke of R is its leg.' },
  {"name": "Apex", "char": "A", "category": "Letterforms", "description": "The upper meeting point of two strokes.", "example": "Look at the top of A, where its diagonal strokes meet."},
  {"name": "Vertex", "char": "V", "category": "Letterforms", "description": "The lower meeting point of two strokes.", "example": "The two diagonals of V meet at its bottom vertex."},
  {"name": "Arm", "char": "E", "category": "Letterforms", "description": "A projecting stroke attached at one end and free at the other.", "example": "The horizontal strokes extending from E are arms."},
  {"name": "Diagonal", "char": "N", "category": "Letterforms", "description": "A slanted stroke within a letter.", "example": "The central stroke of N runs diagonally between its upright stems."},
  {"name": "Spine", "char": "S", "category": "Letterforms", "description": "The central curve that gives S its shape.", "example": "Follow the continuous curve through the middle of S."},
  {"name": "Ear", "char": "g", "category": "Letterforms", "description": "A small projection from the upper part of a lowercase g.", "example": "In Georgia, look for the small stroke at the upper right of g."},
  {"name": "Link", "char": "g", "category": "Letterforms", "description": "The connecting stroke between the upper and lower sections of a double-storey g.", "example": "In Georgia, the narrow link joins the upper bowl to the lower loop."},
  {"name": "Loop", "char": "g", "category": "Letterforms", "description": "The lower enclosed section of a double-storey g.", "example": "Georgia’s g has a lower loop beneath its upper bowl. Single-storey designs differ."},
  {"name": "Eye", "char": "e", "category": "Letterforms", "description": "The small enclosed counter in a lowercase e.", "example": "Look above the horizontal bar inside e to find its eye."},
  {"name": "Tail", "char": "Q", "category": "Letterforms", "description": "A projecting finishing stroke, often descending from a letter.", "example": "The short diagonal that extends from Q is its tail."},
  {"name": "Spur", "char": "G", "category": "Letterforms", "description": "A small projection from a main stroke.", "example": "Look for the small projecting detail at the lower right of Georgia’s G; its form varies by typeface."},
  {"name": "Bracket", "char": "I", "category": "Letterforms", "description": "The curved transition between a serif and its main stroke.", "example": "In Georgia, inspect the curves where the serifs of I join its stem. Sans serif faces have no serif brackets."},
  {"name": "Tittle", "char": "i", "category": "Letterforms", "description": "The dot above a lowercase i or j.", "example": "The separate dot above i is its tittle."},
  {"name": "Stroke contrast", "char": "O", "category": "Letterforms", "description": "The difference between thick and thin parts of a letter’s strokes.", "example": "Compare the sides and top of Georgia’s O, then switch to Inter to compare the contrast."},

];

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

export function AnatomyDetails({ selected }) {
  const [faceIndex, setFaceIndex] = useState(1);
  const [styleIndex, setStyleIndex] = useState(0);
  const [guides, setGuides] = useState(true);
  const face = FACES[faceIndex];
  const styles = face.name === 'Georgia' ? SERIF_STYLES : STYLES;
  const style = styles[styleIndex];
  const metrics = useMetrics(face, style, selected.char);
  return <section className="ta-detail-panel" aria-label="Anatomy details">
    <div className="panel-top"><span className="eyebrow">Type anatomy</span><label className="ta-guides-toggle"><input type="checkbox" checked={guides} onChange={e => setGuides(e.target.checked)} /> Guides</label></div>
    <div aria-live="polite"><span className="eyebrow">{selected.category}</span><h2>{selected.name}</h2><p className="ta-description">{selected.description}</p></div>
    <Specimen glyph={selected} face={face} style={style} metrics={metrics} guides={guides} />
    <p className="ta-example">{selected.example}</p>
    <div>
      <div className="ta-select-row"><label htmlFor="ta-typeface">Typeface</label><select id="ta-typeface" value={faceIndex} onChange={e => setFaceIndex(Number(e.target.value))}>{FACES.map((f, i) => <option key={f.name} value={i}>{f.name}</option>)}</select></div>
      <div className="ta-select-row"><label htmlFor="ta-style">Font style</label><select id="ta-style" value={styleIndex} onChange={e => setStyleIndex(Number(e.target.value))}>{styles.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}</select></div>
    </div>
    <p className="ta-metric-note">Guides show visible bounds measured from h, H, x and p at 1,000 px.</p>
  </section>;
}

export default function TypeAnatomy({ query = '', selected, onSelect }) {
  const terms = ANATOMY.filter(item => `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="ta-page ta-main-layout" aria-label="Interactive typography anatomy">
    <AnatomyDetails selected={selected} />
    <nav className="ta-terms" aria-label="Typography anatomy terms">
      {terms.map(item => <button type="button" className="ta-term" key={item.name} aria-pressed={selected.name === item.name} onClick={() => onSelect(item)}>{item.name}</button>)}
      {!terms.length && <p className="ta-metric-note">No matching anatomy terms.</p>}
    </nav>
  </section>;
}
