import React from 'react';

export default function NavBar(): JSX.Element {
  const raw =
    typeof window !== 'undefined' ? localStorage.getItem('fs_user') : null;
  const user = raw ? JSON.parse(raw) : null;

  function nav(to: string) {
    const fn = (window as any).__navigate;
    if (fn) fn(to);
    else window.location.pathname = to;
  }

  function signOut(e: React.MouseEvent) {
    e.preventDefault();
    localStorage.removeItem('fs_user');
    nav('/landing');
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

          <nav className="flex items-center gap-3">
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
              onClick={() => nav('/flow')}
              className="text-sm text-ios-textMuted hover:text-white transition"
            >
              Flow
            </button>
            <button
              onClick={() => nav('/book')}
              className="text-sm text-ios-textMuted hover:text-white transition"
            >
              Book
            </button>
            <button
              onClick={() => nav('/dashboard')}
              className="text-sm text-ios-textMuted hover:text-white transition"
            >
              Dashboard
            </button>
          </nav>

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
