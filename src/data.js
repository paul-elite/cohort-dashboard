// Content now lives in Supabase (project "cohort-dashboard") and is edited at /admin.
// This module is the in-memory store the app reads from. hydrate() fills it in place,
// so every `import { SESSIONS } from './data.js'` keeps working: objects and arrays are
// mutated, and the plain values are `export let` live bindings.

export let BRAND = '';
export let WORKSPACE = '';
export let MEET_LINK = '';
export const COHORT = { name: '', number: 1 };
export const LIVE_SESSION = { title: '', date: '', live: false };

// Keys are YYYY-MM-DD. { title, tags: [{ label, color, ink }], time }
export const SESSIONS = {};
// Long-form pages for individual sessions. Keys match SESSIONS.
export const SESSION_PAGES = {};
// icon: recording | font | audio | zip | book
export const RESOURCES = [];
export const DEFAULT_TODOS = [];
export const TOOLS = [];

const clear = (o) => { Object.keys(o).forEach((k) => delete o[k]); };

/* "Just now", "3 hrs ago", "Yesterday", "4 days ago", "Last week", then a date. */
export function relativeTime(iso, now = Date.now()) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return 'Just now';
  const m = Math.round(s / 60);
  if (m < 60) return m === 1 ? '1 min ago' : `${m} mins ago`;
  const h = Math.round(m / 60);
  if (h < 24) return h === 1 ? '1 hr ago' : `${h} hrs ago`;
  const d = Math.round(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  if (d < 14) return 'Last week';
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* Fill the store from the shape content.js produces. */
export function hydrate(c) {
  BRAND = c.settings.brand;
  WORKSPACE = c.settings.workspace;
  MEET_LINK = c.settings.meet_link;
  COHORT.name = c.settings.cohort_name;
  COHORT.number = c.settings.cohort_number;
  LIVE_SESSION.title = c.settings.live_title;
  LIVE_SESSION.date = c.settings.live_date || '';
  LIVE_SESSION.live = !!c.settings.live_on;

  clear(SESSIONS); clear(SESSION_PAGES);
  c.sessions.forEach((s) => {
    SESSIONS[s.date] = { title: s.title, tags: s.tags || [], time: s.time_label };
    if (s.page) SESSION_PAGES[s.date] = s.page;
  });
  RESOURCES.splice(0, RESOURCES.length, ...c.resources.map((r) => ({
    id: r.id, name: r.name, kind: r.kind, icon: r.icon, href: r.href, when: relativeTime(r.added_at),
  })));
  TOOLS.splice(0, TOOLS.length, ...c.tools.map((t) => ({ name: t.name, mark: t.mark, color: t.color, href: t.href })));
  DEFAULT_TODOS.splice(0, DEFAULT_TODOS.length, ...c.starter_todos.map((t, i) => ({ id: i + 1, text: t.text, done: t.done })));
}
