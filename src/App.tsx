import React, { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Barbers from './pages/Barbers';
import Communications from './pages/Communications';
import CommunicationDetail from './pages/CommunicationDetail';
import Flow from './pages/Flow';
import FlowCall from './pages/FlowCall';
import FlowSMS from './pages/FlowSMS';
import SignIn from './pages/SignIn';
import ConfirmCode from './pages/ConfirmCode';
import AdminSignIn from './pages/AdminSignIn';
import AdminConfirmCode from './pages/AdminConfirmCode';
import BookAppointment from './pages/BookAppointment';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Customers from './pages/Customers';

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
    p.startsWith('/communications/') ||
    p.toLowerCase().includes('communications/') ||
    p.toLowerCase().includes('communications.html/')
  ) {
    const id = p.split('/communications/')[1] || '';
    return <CommunicationDetail id={id} />;
  }

  if (
    p === '/communications' ||
    p.toLowerCase().includes('communications.html')
  )
    return <Communications />;

  if (p === '/flow' || p.toLowerCase().includes('flow.html')) return <Flow />;

  if (p === '/flow-call' || p.toLowerCase().includes('flow-call'))
    return <FlowCall />;
  if (p === '/flow-sms' || p.toLowerCase().includes('flow-sms'))
    return <FlowSMS />;

  if (p === '/signin' || p.toLowerCase().includes('signin')) return <SignIn />;
  if (p === '/confirm' || p.toLowerCase().includes('confirm'))
    return <ConfirmCode />;

  if (p === '/admin/signin' || p.toLowerCase().includes('admin/signin'))
    return <AdminSignIn />;
  if (p === '/admin/confirm' || p.toLowerCase().includes('admin/confirm'))
    return <AdminConfirmCode />;

  if (p === '/book' || p.toLowerCase().includes('book.html'))
    return <BookAppointment />;

  if (
    p === '/admin/dashboard' ||
    p === '/dashboard' ||
    p.toLowerCase().includes('admin/dashboard') ||
    p.toLowerCase().includes('dashboard')
  )
    return <Dashboard />;

  if (p === '/admin' || (p.toLowerCase().includes('admin') && !p.toLowerCase().includes('admin/signin') && !p.toLowerCase().includes('admin/confirm')))
    return <Admin />;

  if (p === '/customers' || p.toLowerCase().includes('customers'))
    return <Customers />;

  return <Landing />;
}
