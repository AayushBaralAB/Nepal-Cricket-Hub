'use client';

/**
 * Free Cricwaves live-score widgets.
 * Docs: https://www.cricwaves.com/cricket/widgets
 *
 * - Full "scorebox": LIVE / RECENT / UPCOMING tabs, scores, top players, links.
 * - "Strip": horizontal live-score ticker (728×90 style) ideal for headers.
 */
const WIDGET_BASE = 'https://www.cricwaves.com/cricket/widgets/!/';

export function CricwavesScoreBox({ title = 'Live Cricket Scores' }: { title?: string }) {
  return (
    <div className="cricwaves-embed">
      <iframe
        title={title}
        src={`${WIDGET_BASE}f1_zd/nepalcrickethub.com/0/2/All/All/All/100/w?dtab=live&hrInt12=`}
        width="340"
        height="420"
        scrolling="no"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        style={{ margin: 0, padding: 0, display: 'block', maxWidth: '100%' }}
        onLoad={(e) => {
          try {
            const doc = e.currentTarget.contentDocument;
            if (doc) doc.body.style.background = 'transparent';
          } catch {
            /* cross-origin */
          }
        }}
      />
    </div>
  );
}

export function CricwavesStrip({ title = 'Live Score Ticker' }: { title?: string }) {
  return (
    <iframe
      title={title}
      src={`${WIDGET_BASE}h_p11/nepalcrickethub.com/0/2/All/All/All/100/w`}
      width="100%"
      height="90"
      scrolling="no"
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      style={{ margin: 0, padding: 0, display: 'block' }}
    />
  );
}