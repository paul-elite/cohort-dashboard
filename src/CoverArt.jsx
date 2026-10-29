/* Cover art per session. Each is a small typographic or geometric specimen,
   in the spirit of a magazine cover. Sized in container units (cqw) so it
   scales with the card that hosts it. */
export default function CoverArt({ kind }) {
  if (kind === 'type') {
    return (
      <span className="sess-art type" aria-hidden="true">
        <span className="aa">Aa</span>
        <span className="rule"><i style={{ width: '100%' }} /><i style={{ width: '74%' }} /><i style={{ width: '88%' }} /></span>
      </span>
    );
  }
  if (kind === 'color') {
    return (
      <span className="sess-art color" aria-hidden="true">
        <span className="swatch">
          {['#191a2c', '#46475e', '#6e6f88', '#a6a7bb', '#0A84FF', '#ececf2'].map((c) => <i key={c} style={{ background: c }} />)}
        </span>
      </span>
    );
  }
  if (kind === 'screen') {
    return <span className="sess-art screen" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i} />)}</span>;
  }
  if (kind === 'wire') {
    return (
      <span className="sess-art wire" aria-hidden="true">
        <span className="frame"><i className="l1" /><i className="l2" /><i className="l3" /></span>
      </span>
    );
  }
  if (kind === 'motion') {
    return (
      <span className="sess-art motion" aria-hidden="true">
        <span className="track"><i className="d1" /><i className="d2" /><i className="d3" /></span>
        <span className="ticks"><em>0</em><em>150ms</em><em>300ms</em></span>
      </span>
    );
  }
  return (
    <span className="sess-art demo" aria-hidden="true">
      <span className="type">Demo<br />day</span>
      <span className="stub">Live · 5:00 PM</span>
    </span>
  );
}
