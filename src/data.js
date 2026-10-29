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
    kicker: 'Field notes on reading',
    dek: "Reading feels like one smooth sweep across the page. It's really a series of jumps, landings and guesses — and type is the set of instructions we hand the eye.",
    intro: "We slowed the act of reading down in Session 01 to see what it is made of. The eye does not glide along a line: it stops, samples a few letters, then jumps again. Each stop lasts about a quarter of a second, and each jump lands six to nine characters ahead. Everything typography does is either helping those jumps or getting in their way.",
    saccade: "The eye does not glide across a line of type. It jumps in short saccades, lands on a word, and pauses to recognise its shape.",
    labIntro: "The same paragraph, set four ways. Move the sliders and watch the line do the work — the longest measure is rarely the most comfortable one.",
    excerpt: "Good typography is mostly a matter of removing obstacles. The reader should never notice the typeface, the measure or the leading — only the sense moving forward. Give the eye short, even lines, keep the rhythm between them steady, and it will do the rest without complaint.",
    notes: [
      { title: 'Measure before typeface', body: 'Line length does more for reading than the choice between serif and sans. Between 45 and 75 characters the return sweep stays cheap. Past 90, readers start losing their place.' },
      { title: 'Leading is breathing room', body: 'At 16–18px, a line height around 1.5 keeps ascenders and descenders from crowding without letting lines drift apart. Longer lines need more leading; short lines can take less.' },
      { title: 'We read word shapes', body: 'Ascenders and descenders give words a silhouette. All-caps flattens that silhouette, which is why a long passage in capitals costs more effort than the same words in lowercase.' },
    ],
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
