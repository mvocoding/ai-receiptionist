import React from 'react';
import Landing from './pages/Landing';
import Barbers from './pages/Barbers';
import Communications from './pages/Communications';
import Flow from './pages/Flow';

export default function App(): JSX.Element {
  const path = window.location.pathname || '/';
  // normalize trailing slashes
  const p = path.replace(/\/+$/, '') || '/';

  if (p === '/' || p === '/landing' || p === '/landing.html') {
    return <Landing />;
  }

  if (p === '/barbers' || p.toLowerCase().includes('barbers.html')) {
    return <Barbers />;
  }

  if (
    p === '/communications' ||
    p.toLowerCase().includes('communications.html')
  ) {
    return <Communications />;
  }

  if (p === '/flow' || p.toLowerCase().includes('flow.html')) {
    return <Flow />;
  }

  // fallback to landing
  return <Landing />;
}
