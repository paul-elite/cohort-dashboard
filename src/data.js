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
    intro: "Session 01 follows the opening of Chapter 4 of Matej Latin’s “Better Web Typography for a Better Web”. Latin starts with how reading actually works: not a letter-by-letter scan but word-by-word shape recognition, moved along by quick eye movements called saccades and paused by fixations, usually at the end of words. From there he builds the chapter’s central idea — the equilateral triangle of a perfect paragraph, where type size, line length and line height are three sides that only work in balance.",
    saccade: "We don’t read letter by letter. We read word by word, recognising shapes we already know. Our eyes move in quick saccades, broken by fixations, usually at the end of a word.",
    labIntro: "Set the three sides yourself: type size, measure and leading. Change one and the other two need to answer. The typeface switch is here for the old serif-versus-sans question — Latin calls the idea that sans-serif is easier to read on screen a myth. Size, line length and line height do the real work.",
    quote: {
      text: "It takes three things to get a perfect paragraph: font size, line height and line length. They need to be balanced.",
      cite: "Matej Latin, Better Web Typography for a Better Web",
    },
    excerpt: "A paragraph is a balance of three things: the size of the type, the length of the line and the space between the lines. None of them can be set in isolation. Make the lines too long and the eye has too few breaks; make them too short and it has to switch too often. Set the leading too tight and the lines crowd each other; too loose and they drift apart. The three sides have to match.",
    notes: [
      { title: "We read word by word", body: "Letter-by-letter reading is for people still learning. Once we know the words, we recognise their shapes and move along in saccades, with fixations — usually at the end of words — doing the recognising." },
      { title: "45 to 75 characters", body: "That is the recommended line length, spaces included. Shorter lines mean too much switching; longer ones give the eye too few pauses. Long-word languages such as German (11.66 characters a word, against 8 in English) should lean towards 75." },
      { title: "Start at 16 and 18", body: "Body text should be at least 16px on mobile and 18–22px on desktop. Typefaces differ in apparent size — a heavy face reads larger at the same pixel size — so judge the size against a book held at arm’s length, not the number alone." },
      { title: "Balance the three sides", body: "Line height usually sits between 1.3 and 1.6 for body text, and 1–1.2 for headings. Longer lines, larger sizes and heavier colour all need more leading. Change the measure and you have to revisit the leading: the triangle is never set once." },
    ],
    source: "Adapted from “Better Web Typography for a Better Web” (2nd ed.) by Matej Latin — Chapter 4, “Equilateral Triangle of a Perfect Paragraph”.",
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
