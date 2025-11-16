import React, { useEffect } from 'react';

export default function LiveGemini(): JSX.Element {
  useEffect(() => {
    document.title = 'Live Gemini · Fade Station';
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute(
      'content',
      'Open Live Gemini (external) or view within the app (if allowed).'
    );
    if (!document.querySelector('meta[name="description"]'))
      document.head.appendChild(meta);
  }, []);

  const openExternal = () => {
    window.open('https://gemini.google.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-start justify-center p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Live Gemini</h1>
            <p className="text-sm text-ios-textMuted">
              Launch the Live Gemini experience from the app.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                (window as any).__navigate?.('/') ??
                (window.location.pathname = '/')
              }
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10"
            >
              Back
            </button>
            <button
              onClick={openExternal}
              className="px-3 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 transition"
            >
              Open Live Gemini
            </button>
          </div>
        </header>

        <section className="bg-gradient-to-b from-[#0b0b0b] to-[#0d0d0d] border border-ios-border rounded-2xl p-4 shadow-glow">
          <p className="text-sm text-ios-textMuted mb-4">
            This page provides a quick way to open the official Live Gemini
            site. Some sites block embedding, so the primary action is to open
            in a new tab. For development you can try the embedded preview
            below; if it shows blank, use the button.
          </p>

          <div className="h-[480px] bg-black rounded-lg overflow-hidden border border-white/5">
            <iframe
              title="Live Gemini preview"
              src="https://gemini.google.com/"
              className="w-full h-full"
              sandbox="allow-scripts allow-forms allow-same-origin"
              style={{ border: 'none' }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
