// Edit these to update the dashboard.

export const BRAND = 'Paulelite.me';
export const MEET_LINK = 'https://meet.google.com/';

export const LIVE_SESSION = {
  title: 'How Humans Read',
  month: 'OCT',
  day: '10',
};

const C = {
  violet: ['#5e5ce6', '#efeffd', '#3634a3'],
  green: ['#30b350', '#e8f7ec', '#1b6e30'],
  purple: ['#af52de', '#f6ecfb', '#7a2ca0'],
  blue: ['#0a84ff', '#e6f2ff', '#0058b8'],
  orange: ['#ff9f0a', '#fff4e3', '#9a5800'],
  indigo: ['#3a5bd9', '#eaeefc', '#243f9e'],
  yellow: ['#e0a800', '#fdf6dc', '#7a5c00'],
  teal: ['#14a39a', '#e3f6f4', '#0b6b65'],
  pink: ['#ff2d55', '#ffe8ed', '#b0102f'],
};
const t = (label, c) => ({ label, color: C[c][0], soft: C[c][1], ink: C[c][2] });

// Keys are YYYY-MM-DD.
export const SESSIONS = {
  '2026-10-10': [t('Type', 'violet'), t('Reading', 'green')],
  '2026-10-17': [t('Color', 'purple'), t('Light', 'blue')],
  '2026-10-18': [t('Eyes', 'orange'), t('Screens', 'indigo')],
  '2026-10-24': [t('Layout', 'yellow'), t('Macro design', 'teal')],
  '2026-10-25': [t('Interactions', 'green'), t('Micro design', 'purple')],
  '2026-10-31': [t('Demo day', 'pink')],
};

export const RESOURCES = [
  { name: 'Class Recordings', when: 'Just now', folder: true, href: '#' },
  { name: 'Geist', when: '2 mins ago', mark: 'Aa', fill: '#fdf3c7', ink: '#7a5c00', href: 'https://vercel.com/font' },
  { name: 'Swoosh Sample', when: '3 hrs ago', mark: 'WAV', fill: '#e2efff', ink: '#0058b8', href: '#' },
  { name: 'Click Sound', when: 'Yesterday', mark: 'WAV', fill: '#e2efff', ink: '#0058b8', href: '#' },
  { name: 'Helvetica', when: '4 days ago', mark: 'ZIP', fill: '#eef0f4', ink: '#3a3a3c', href: '#' },
  { name: 'How Humans Read', when: 'Last week', mark: 'PDF', fill: '#ffe8ed', ink: '#b0102f', href: '#' },
  { name: 'Thinking in Colors', when: 'Last week', mark: 'PDF', fill: '#ffe8ed', ink: '#b0102f', href: '#' },
  { name: 'Screens', when: 'Oct 2', folder: true, href: '#' },
];

export const DEFAULT_TODOS = [
  { id: 1, text: 'Deliver design screens', done: true },
  { id: 2, text: 'Read chapter on type hierarchy', done: false },
  { id: 3, text: 'Share color study in group', done: false },
];

export const TOOLS = [
  { name: 'Figma', mark: 'F', color: '#7a3fd6', href: 'https://figma.com' },
  { name: 'Mobbin', mark: 'M', color: '#1d1d1f', href: 'https://mobbin.com' },
  { name: 'Type Scale', mark: 'T', color: '#0b6b65', href: 'https://typescale.com' },
  { name: 'Contrast Checker', mark: 'C', color: '#9a5800', href: 'https://webaim.org/resources/contrastchecker/' },
];
