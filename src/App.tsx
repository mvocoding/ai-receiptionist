import React from 'react';
import Landing from './pages/Landing';
import Barbers from './pages/Barbers';
import Communications from './pages/Communications';
import Flow from './pages/Flow';

// Safely import Recordings module (handles default or named exports)
import * as RecordingsModule from './pages/Recordings';
const RecordingsCandidate: any =
  (RecordingsModule as any).default ||
  (RecordingsModule as any).Recordings ||
  (RecordingsModule as any).RecordingsPage ||
  (RecordingsModule as any).RecordingsComponent ||
  RecordingsModule;

export default function App(): JSX.Element {
  const path = window.location.pathname || '/';
  const p = path.replace(/\/+$/, '') || '/';

  if (p === '/' || p === '/landing' || p === '/landing.html')
    return <Landing />;

  if (p === '/barbers' || p.toLowerCase().includes('barbers.html'))
    return <Barbers />;

  if (
    p === '/communications' ||
    p.toLowerCase().includes('communications.html')
  )
    return <Communications />;

  if (p === '/flow' || p.toLowerCase().includes('flow.html')) return <Flow />;

  if (p === '/recordings' || p.toLowerCase().includes('recordings.html')) {
    const Rec = RecordingsCandidate;
    // If the resolved export is the module object, try to use common keys or fallback to a simple fragment
    if (!Rec || (typeof Rec === 'object' && !('$$typeof' in Rec))) {
      // try known named exports
      const maybe =
        (RecordingsModule as any).Recordings ||
        (RecordingsModule as any).RecordingsPage ||
        (RecordingsModule as any).RecordingsComponent;
      if (maybe) return React.createElement(maybe);
      // final fallback: render an empty placeholder to avoid crash
      return (
        <div className="min-h-screen flex items-center justify-center text-ios-textMuted">
          Recordings page not found
        </div>
      );
    }
    return React.createElement(Rec);
  }

  // fallback to landing
  return <Landing />;
}
