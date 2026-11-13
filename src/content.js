import { supabase } from './supabase.js';

const CACHE = 'cohort-content-v1';

/* Everything the public site shows, in one round of parallel reads. */
export async function fetchContent() {
  const [settings, sessions, resources, tools, todos] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('sessions').select('date, title, time_label, tags, page').eq('published', true).order('date'),
    supabase.from('resources').select('id, name, kind, icon, href, added_at').eq('published', true).order('position').order('added_at', { ascending: false }),
    supabase.from('tools').select('name, mark, color, href').eq('published', true).order('position'),
    supabase.from('starter_todos').select('text, done').order('position'),
  ]);
  const err = [settings, sessions, resources, tools, todos].find((r) => r.error);
  if (err) throw err.error;
  if (!settings.data) throw new Error('Site settings are missing.');
  return { settings: settings.data, sessions: sessions.data, resources: resources.data, tools: tools.data, starter_todos: todos.data };
}

export function readCache() {
  try { const raw = localStorage.getItem(CACHE); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
export function writeCache(c) {
  try { localStorage.setItem(CACHE, JSON.stringify(c)); } catch (e) { /* storage unavailable */ }
}
