import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './workspace.css';
import { hydrate } from './data.js';
import { fetchContent, readCache, writeCache } from './content.js';

const root = createRoot(document.getElementById('root'));
const path = location.pathname.replace(/\/+$/, '');

function Notice({ title, body, action }) {
  return (
    <div className="boot">
      <div className="boot-card">
        <p className="boot-title">{title}</p>
        {body && <p className="boot-body">{body}</p>}
        {action}
      </div>
    </div>
  );
}

if (path === '/admin' || path.startsWith('/admin/')) {
  import('./admin/Admin.jsx').then(({ default: Admin }) => root.render(<React.StrictMode><Admin /></React.StrictMode>));
} else {
  boot();
}

/* Paint straight away from the last copy this browser saw, then refresh from Supabase.
   A first visit waits for the network; if that fails it says so instead of showing stale content. */
async function boot() {
  const { default: App } = await import('./App.jsx');
  const render = (v) => root.render(<React.StrictMode><App key={v} /></React.StrictMode>);
  const cached = readCache();
  if (cached) { hydrate(cached); render('cache'); }
  else root.render(<Notice title="Loading the cohort…" />);
  try {
    const fresh = await fetchContent();
    writeCache(fresh);
    if (!cached || JSON.stringify(cached) !== JSON.stringify(fresh)) { hydrate(fresh); render('live'); }
  } catch (e) {
    console.error('Could not load content', e);
    if (!cached) {
      root.render(<Notice title="Couldn’t load the cohort" body="Check your connection and try again."
        action={<button type="button" className="ws-btn primary" onClick={boot}>Try again</button>} />);
    }
  }
}
