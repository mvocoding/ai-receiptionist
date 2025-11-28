import React, { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Barbers from './pages/Barbers';
import Communications from './pages/Communications';
import CommunicationDetail from './pages/CommunicationDetail';
import AIKnowledge from './pages/AIKnowledge';
import SignIn from './pages/SignIn';
import ConfirmCode from './pages/ConfirmCode';
import AdminSignIn from './pages/AdminSignIn';
import AdminConfirmCode from './pages/AdminConfirmCode';
import BookAppointment from './pages/BookAppointment';
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

  const lower = p.toLowerCase();
  const routes = [
    {
      match: () => p === '/' || lower.includes('landing'),
      element: <Landing />,
    },
    {
      match: () => lower.includes('barbers'),
      element: <Barbers />,
    },
    {
      match: () => lower.includes('communications/'),
      element: (() => {
        const id = p.split('/communications/')[1] || '';
        return <CommunicationDetail id={id} />;
      })(),
    },
    {
      match: () => lower.includes('communications'),
      element: <Communications />,
    },
    {
      match: () => lower.includes('ai-knowledge'),
      element: <AIKnowledge />,
    },
    {
      match: () => lower.includes('signin'),
      element: <SignIn />,
    },
    {
      match: () => lower.includes('confirm') && !lower.includes('admin'),
      element: <ConfirmCode />,
    },
    {
      match: () => lower.includes('admin/signin'),
      element: <AdminSignIn />,
    },
    {
      match: () => lower.includes('admin/confirm'),
      element: <AdminConfirmCode />,
    },
    {
      match: () => lower.includes('book'),
      element: <BookAppointment />,
    },
    {
      match: () =>
        lower.startsWith('/admin') &&
        !lower.includes('signin') &&
        !lower.includes('confirm'),
      element: <Admin />,
    },
    {
      match: () => lower.includes('customers'),
      element: <Customers />,
    },
  ];

  const route = routes.find((r) => r.match());

  return route ? route.element : <Landing />;
}
