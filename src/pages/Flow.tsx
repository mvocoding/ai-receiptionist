import React from 'react';
import NavBar from '../components/NavBar';

export default function Flow(): JSX.Element {
  const nav = (to: string) => {
    const fn = (window as any).__navigate;
    if (fn) fn(to);
    else window.location.pathname = to;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />
      <div className="mx-auto max-w-4xl px-4 py-24">

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold mb-2">Call Flow</h2>
            <p className="text-sm text-white/60 mb-4">
              Design call handling flows and auto-responses.
            </p>
            <button
              onClick={() => nav('/flow-call')}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600"
            >
              Open Call Flow
            </button>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold mb-2">SMS Flow</h2>
            <p className="text-sm text-white/60 mb-4">
              Design SMS conversation flows and auto-responses.
            </p>
            <button
              onClick={() => nav('/flow-sms')}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600"
            >
              Open SMS Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
