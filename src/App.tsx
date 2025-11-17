import React, { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Barbers from './pages/Barbers';
import Communications from './pages/Communications';
import Flow from './pages/Flow';
import FlowCall from './pages/FlowCall';
import FlowSMS from './pages/FlowSMS';
import Recordings from './pages/Recordings';
import SignIn from './pages/SignIn';
import ConfirmCode from './pages/ConfirmCode';
import LiveGemini from './pages/LiveGemini';
import BookAppointment from './pages/BookAppointment';
import Dashboard from './pages/Dashboard';

export default function App(): JSX.Element {
  const [path, setPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);

    (window as any).__navigate = (to: string) => {
      if (!to) return;
      if (to !== window.location.pathname) {
        window.history.pushState({}, '', to);
        setPath(to);
      }
    };

    return () => {
      window.removeEventListener('popstate', onPop);
      delete (window as any).__navigate;
    };
  }, []);

  const p = (path || '/').replace(/\/+$/, '') || '/';

  if (p === '/' || p === '/landing' || p === '/landing.html')
    return <Landing />;

  if (p === '/barbers' || p.toLowerCase().includes('barbers.html'))
    return <Barbers />;

  if (
    p === '/communications' ||
    p.toLowerCase().includes('communications.html')
  )
    return <Communications />;

  // flow selector
  if (p === '/flow' || p.toLowerCase().includes('flow.html')) return <Flow />;

  // new flow builders
  if (p === '/flow-call' || p.toLowerCase().includes('flow-call'))
    return <FlowCall />;
  if (p === '/flow-sms' || p.toLowerCase().includes('flow-sms'))
    return <FlowSMS />;

  if (p === '/recordings' || p.toLowerCase().includes('recordings.html'))
    return <Recordings />;

  if (p === '/signin' || p.toLowerCase().includes('signin')) return <SignIn />;
  if (p === '/confirm' || p.toLowerCase().includes('confirm'))
    return <ConfirmCode />;

  if (p === '/live-gemini' || p.toLowerCase().includes('live-gemini'))
    return <LiveGemini />;

  if (p === '/book' || p.toLowerCase().includes('book.html'))
    return <BookAppointment />;

  if (p === '/dashboard' || p.toLowerCase().includes('dashboard'))
    return <Dashboard />;

  return <Landing />;
}
