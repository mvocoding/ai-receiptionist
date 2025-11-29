import React from 'react';
import { supabase } from '../lib/supabase';

export default function NavBar(): JSX.Element {
  const isBrowser = typeof window !== 'undefined';
  let user: { email?: string } | null = null;

  if (isBrowser) {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      try {
        user = JSON.parse(raw);
      } catch {
        user = null;
      }
    }
  }

  const currentPath = isBrowser ? window.location.pathname : '';
  const isLanding =
    currentPath === '/' ||
    currentPath === '/landing' ||
    currentPath === '/home';

  async function signOut(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Failed to sign out from Supabase:', err);
    } finally {
      localStorage.removeItem('currentUser');
      sessionStorage.clear();
      (window as any).gotopage('/landing');
    }
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="backdrop-blur-md bg-white/5 border border-ios-border shadow-glow px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (user) (window as any).gotopage('/dashboard');
                else (window as any).gotopage('/');
              }}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <div>
                <h1 className="uppercase text-lg font-semibold tracking-tight">
                  Fade Station
                </h1>
              </div>
            </button>
          </div>

          {user && (
            <nav className="flex items-center gap-3">
              <button
                onClick={() => (window as any).gotopage('/dashboard')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Dashboard
              </button>
              <button
                onClick={() => (window as any).gotopage('/admin')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Admin
              </button>
              <button
                onClick={() => (window as any).gotopage('/communications')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Communications
              </button>
              <button
                onClick={() => (window as any).gotopage('/barbers')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Barbers
              </button>
              <button
                onClick={() => (window as any).gotopage('/customers')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Customers
              </button>
              <button
                onClick={() => (window as any).gotopage('/ai-knowledge')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                AI Knowledge
              </button>
              <button
                onClick={() => (window as any).gotopage('/book')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Book Appointment
              </button>
            </nav>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-xs text-ios-textMuted mr-2">
                  {user.email}
                </div>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  Sign out
                </button>
              </>
            ) : isLanding ? (
              <button
                onClick={() => (window as any).gotopage('/signin')}
                className="px-3 py-1.5 rounded-xl text-xs bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition shadow-lg"
              >
                Client Sign in
              </button>
            ) : (
              <button
                onClick={() => (window as any).gotopage('/signin')}
                className="px-3 py-1.5 rounded-xl text-xs bg-emerald-500/90 hover:bg-emerald-500 transition shadow"
              >
                Client Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
