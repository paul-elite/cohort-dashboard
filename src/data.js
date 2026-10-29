// Edit these to update the dashboard.

export const BRAND = 'Paulelite.me';
export const COHORT = { name: 'DesignTales', number: 1 };
export const MEET_LINK = 'https://meet.google.com/';

export const LIVE_SESSION = {
  title: 'How Humans Read',
  date: '2026-10-10',
  live: true,
};

// Bright, cheerful label colours. Each pairs a vivid fill with the ink
// (white or deep violet-black) that keeps the label readable at 4.5:1 or better.
const INK = '#1b1530';
const C = {
  violet: ['#6A45FF', '#ffffff'],
  green: ['#1FCB6B', INK],
  purple: ['#B44DFF', INK],
  blue: ['#1E90FF', INK],
  orange: ['#FF7A1A', INK],
  indigo: ['#3B5BFF', '#ffffff'],
  yellow: ['#FFC21A', INK],
  teal: ['#12C7B8', INK],
  magenta: ['#E040FB', INK],
  pink: ['#FF3D8B', INK],
};
const t = (label, c) => ({ label, color: C[c][0], ink: C[c][1] });

// Keys are YYYY-MM-DD.
export const SESSIONS = {
  '2026-10-10': { title: 'How Humans Read', tags: [t('Type', 'violet'), t('Reading', 'green')], time: '6:00 PM WAT' },
  '2026-10-17': { title: 'Seeing in Color', tags: [t('Color', 'purple'), t('Light', 'blue')], time: '6:00 PM WAT' },
  '2026-10-18': { title: 'Eyes on Screens', tags: [t('Eyes', 'orange'), t('Screens', 'indigo')], time: '6:00 PM WAT' },
  '2026-10-24': { title: 'Layout & Macro Design', tags: [t('Layout', 'yellow'), t('Macro design', 'teal')], time: '6:00 PM WAT' },
  '2026-10-25': { title: 'Interactions & Micro Design', tags: [t('Interactions', 'green'), t('Micro design', 'magenta')], time: '6:00 PM WAT' },
  '2026-10-31': { title: 'Demo Day', tags: [t('Demo day', 'pink')], time: '5:00 PM WAT' },
};

// Long-form pages for individual sessions. Keys match SESSIONS; a session
// without an entry opens the day panel instead.
export const SESSION_PAGES = {
  '2026-10-10': {
    kicker: 'From the reading',
    dek: "We don’t read letter by letter. We read word by word, recognising shapes — and typography’s job is to make the eye’s jumps across the page as cheap as possible.",
    intro: "Session 01 starts where Matej Latin starts, in Chapter 4 of “Better Web Typography for a Better Web”: with the mechanics of reading. Words are recognised as shapes, and the eye crosses a line in saccades, pausing at fixations. From there the chapter builds the equilateral triangle of a perfect paragraph — size, line length and line height as three sides that only work in balance. The rest of this page follows the book outward: how x-height changes the way a size looks, how rhythm holds a page together, and why every size should come from a scale rather than a guess.",
    saccade: "We don’t read letter by letter. We read word by word, recognising shapes we already know. Our eyes move in quick saccades, broken by fixations, usually at the end of a word.",
    labIntro: "Set the three sides yourself: type size, measure and leading. Change one and the other two need to answer. The typeface switch is here for the old serif-versus-sans question — Latin calls the idea that sans-serif is easier to read on screen a myth. Size, line length and line height do the real work. Turn on the baseline grid to see the unit the rest of the page is built from.",
    quote: {
      text: "It takes three things to get a perfect paragraph: font size, line height and line length. They need to be balanced.",
      cite: "Matej Latin, Better Web Typography for a Better Web",
    },
    excerpt: "A paragraph is a balance of three things: the size of the type, the length of the line and the space between the lines. None of them can be set in isolation. Make the lines too long and the eye has too few breaks; make them too short and it has to switch too often. Set the leading too tight and the lines crowd each other; too loose and they drift apart. The three sides have to match.",
    specimen: {
      lede: "Two paragraphs can share a size, a colour and a leading and still not look alike. One reads heavier and larger; the other lighter and smaller. Latin opens the book with the anatomy behind that: a pixel value is a starting point, not a measure of how big type looks.",
      sample: "The quick brown fox jumps over the lazy dog. Rounded letters are drawn slightly larger so they look the same size.",
      faces: [
        { name: "Inter", kind: "Sans-serif", stack: "'Inter', system-ui, sans-serif", note: "A tall x-height and little stroke contrast. It reads modern, sturdy and larger than its size." },
        { name: "Georgia", kind: "Serif", stack: "Georgia, 'Times New Roman', serif", note: "A smaller x-height and noticeable contrast. It reads classical, lighter and smaller." },
      ],
      caption: "Both paragraphs are 17px, in the same colour, with the same leading. The x-heights are measured in the browser, in pixels, at that size.",
      points: [
        { title: "Type colour isn’t colour", body: "In typography, type colour means how heavy black text looks on white. Stroke contrast, x-height and style decide it: Georgia, at the same size and weight, reads lighter than Merriweather because its strokes vary more." },
        { title: "x-height sets apparent size", body: "Taller x-heights are considered modern and easier to read — Merriweather, Roboto, Freight Text. Smaller ones read as classical: Garamond, Baskerville, Bodoni. That is why 16px in one face can look like 18px in another." },
      ],
    },
    rhythm: {
      lede: "Latin splits rhythm into two jobs. Horizontal rhythm is the line: spacing, alignment, the flow of words. Vertical rhythm is the page: leading, margins and the grid that lets a reader scan the structure before reading a word.",
      columns: [
        {
          title: "Horizontal · legibility",
          chapter: "Ch. 6",
          items: [
            "Don’t letterspace lowercase body text. Goudy: “A man who would letterspace lower case would steal sheep.” It slows word recognition.",
            "Tighten headings by 3–5%. Spacing looks optically looser at large sizes.",
            "Open uppercase and small caps by 5–10%, so the letters stay distinguishable.",
            "Don’t justify on the web. Browsers leave rivers of white between words; Gov.uk and dyslexia guidance both recommend left alignment.",
          ],
        },
        {
          title: "Vertical · hierarchy",
          chapter: "Ch. 6",
          items: [
            "Line height is the base unit. Set every heading’s leading and every margin as a multiple of it.",
            "Give a heading a smaller bottom margin than its top. It belongs to the text beneath it, not floating between blocks.",
            "Let images break the grid. “Use the baseline grid as a guide, not as a restraint.”",
          ],
        },
      ],
      demo: {
        text: "Web browsers render justified text very poorly. They don’t have the necessary algorithms to properly set the spacing between words and even individual letters. That’s why justified texts come with patches of space between the words: rivers of white between the black of text.",
        left: "Left-aligned: the space between words stays even and every line ends clearly. This is what Latin recommends for the web.",
        justified: "Justified: the browser stretches the spaces to fill the column, opening rivers of white through the paragraph. Hyphenation helps a little; left alignment avoids the problem.",
      },
    },
    scale: {
      lede: "A paragraph can be perfect and the page still chaotic, because there are infinite sizes to choose from. Latin’s fix is a modular scale: one base size and one ratio, so every size is related to the others. His own preference is the Perfect Fifth, 1.5.",
      ratio: "Perfect Fifth · 1.5×",
      formula: "1.5ⁿ × 18px",
      steps: [
        { px: 60.75, role: "Heading 2" },
        { px: 40.5, role: "Heading 3" },
        { px: 27, role: "Heading 4" },
        { px: 18, role: "Body" },
        { px: 12, role: "Caption" },
      ],
      notes: [
        { title: "Why a scale", body: "The book’s example sizes are 8, 12, 18, 27, 40.5, 60.75, 91.125 and 136.688. Choosing from that list ends the 24-versus-25-pixel debate, and readers only have to learn a few sizes to understand the hierarchy." },
        { title: "Why it survives mobile", body: "Only the root size changes: 16px on phones, 18px on desktop. Because every other size is relative, the scale comes along. Leading is tightened to 1.4 for the narrow column and returns to 1.45 when it widens." },
      ],
    },
    notes: [
      { title: "Read the paragraph as a triangle", chapter: "Ch. 4", body: "45–75 characters including spaces, 18–22px on desktop and 1.3–1.7 leading. Change one side and the other two need revisiting: a paragraph is set, not typed." },
      { title: "Judge size by x-height", chapter: "Ch. 2", body: "Pixels don’t tell you how big type looks. A tall x-height reads larger, darker and more modern; a small one reads classical and lighter. Set the same size in two faces and compare before choosing." },
      { title: "Left-align, and leave lowercase alone", chapter: "Ch. 6", body: "Justified text on the web produces rivers of white and is harder for dyslexic readers. Letterspacing lowercase body text slows recognition. Save tracking for headings (3–5% tighter) and caps (5–10% wider)." },
      { title: "Keep one rhythm unit", chapter: "Ch. 6", body: "Use line height as the base for margins and heading leading. Multiples keep the page in tune, and a smaller bottom margin than top binds a heading to its text." },
      { title: "Choose sizes from a scale", chapter: "Ch. 7 & 9", body: "One base size and one ratio — the Perfect Fifth is 1.5 — give every size a reason. Then let the root size carry the scale from 16px on phones to 18px on desktop." },
    ],
    source: "Adapted from “Better Web Typography for a Better Web” (2nd ed.) by Matej Latin — Chapters 2, 4, 6, 7 and 9.",
  },
};

// icon: recording | font | audio | zip | book
export const RESOURCES = [
  { name: 'Class Recording', when: 'Just now', icon: 'recording', kind: 'Video', href: '#' },
  { name: 'Geist', when: '2 mins ago', icon: 'font', kind: 'Font', href: 'https://vercel.com/font' },
  { name: 'Swoosh Sample', when: '3 hrs ago', icon: 'audio', kind: 'Audio', href: '#' },
  { name: 'Click Sound', when: 'Yesterday', icon: 'audio', kind: 'Audio', href: '#' },
  { name: 'Helvetica', when: '4 days ago', icon: 'zip', kind: 'ZIP archive', href: '#' },
  { name: 'How Humans Read', when: 'Last week', icon: 'book', kind: 'Book', href: '#' },
];

export const DEFAULT_TODOS = [
  { id: 1, text: 'Deliver design screens', done: true },
  { id: 2, text: 'Read chapter on type hierarchy', done: false },
  { id: 3, text: 'Share color study in group', done: false },
];

export const TOOLS = [
  { name: 'Figma', mark: 'F', color: '#8B5CFF', href: 'https://figma.com' },
  { name: 'Mobbin', mark: 'M', color: '#1d1d1f', href: 'https://mobbin.com' },
  { name: 'Type Scale', mark: 'T', color: '#0FB5A6', href: 'https://typescale.com' },
  { name: 'Contrast Checker', mark: 'C', color: '#FF8A1F', href: 'https://webaim.org/resources/contrastchecker/' },
];
