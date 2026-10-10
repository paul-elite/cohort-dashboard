// Edit these to update the dashboard.

export const BRAND = 'Paulelite.me';
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
