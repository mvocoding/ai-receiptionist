import React from 'react';
import { supabase } from '../lib/supabase';

export default function NavBar(): JSX.Element {
  const isBrowser = typeof window !== 'undefined';
  let user: { email?: string } | null = null;

  if (isBrowser) {
    const raw = localStorage.getItem('fs_user');
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

  function nav(to: string) {
    const fn = (window as any).__navigate;
    if (fn) fn(to);
    else window.location.pathname = to;
  }

  async function signOut(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Failed to sign out from Supabase:', err);
    } finally {
      localStorage.removeItem('fs_user');
      sessionStorage.clear();
      nav('/landing');
    }
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="backdrop-blur-md bg-white/5 border border-ios-border rounded-2xl shadow-glow px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav('/landing')}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <span className="text-xs font-semibold">FS</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Fade Station
                </h1>
                <p className="text-xs text-ios-textMuted">AI Receptionist</p>
              </div>
            </button>
          </div>

          {user && (
            <nav className="flex items-center gap-3">
              <button
                onClick={() => nav('/dashboard')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Dashboard
              </button>
              <button
                onClick={() => nav('/communications')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Communications
              </button>
              <button
                onClick={() => nav('/barbers')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Barbers
              </button>
              <button
                onClick={() => nav('/customers')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Customers
              </button>
              <button
                onClick={() => nav('/flow')}
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Flow
              </button>
              <button
                onClick={() => nav('/book')}
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
                onClick={() => nav('/signin')}
                className="px-3 py-1.5 rounded-xl text-xs bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition shadow-lg"
              >
                Get Started
              </button>
            ) : (
              <button
                onClick={() => nav('/signin')}
                className="px-3 py-1.5 rounded-xl text-xs bg-emerald-500/90 hover:bg-emerald-500 transition shadow"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
