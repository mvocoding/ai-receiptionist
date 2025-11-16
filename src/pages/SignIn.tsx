import React, { useEffect, useState } from 'react';

export default function SignIn(): JSX.Element {
  useEffect(() => {
    document.title = 'Sign in · Fade Station';
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute(
      'content',
      'Sign in to Fade Station (enter your email to receive a code)'
    );
    if (!document.querySelector('meta[name="description"]'))
      document.head.appendChild(meta);
  }, []);

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function generateCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    const code = generateCode();
    const payload = {
      email: trimmed,
      code,
      createdAt: Date.now(),
    };
    sessionStorage.setItem('fs_signin', JSON.stringify(payload));

    setInfo(`A 4-digit code was sent to ${trimmed}. (Check console in demo)`);
    (window as any).__navigate?.('/confirm') ??
      (window.location.pathname = '/confirm');
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-sky-900/20 via-black to-cyan-900/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMTExMTEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2MjBoMlYzNGgtMnpNMjQgMjR2MmgxMnYtMmgtMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-2xl">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 flex items-center justify-center backdrop-blur-md border border-white/10">
            <span className="text-2xl font-bold">FS</span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#0b0b0b]/95 to-[#0d0d0d]/95 backdrop-blur-xl border border-ios-border rounded-3xl p-12 shadow-glow">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Welcome to Fade Station
            </h1>
            <p className="text-lg text-ios-textMuted mb-8">
              Enter your email to get started with AI-powered barbershop
              management.
            </p>

            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                    setInfo(null);
                  }}
                  className="w-full bg-white/5 border border-ios-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-shadow"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-3 text-rose-300">
                  {error}
                </div>
              )}

              {info && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-300">
                  {info}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition shadow-lg shadow-sky-500/25"
                >
                  Continue with Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    (window as any).__navigate?.('/') ??
                      (window.location.pathname = '/');
                  }}
                  className="px-6 py-3 rounded-xl text-base font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  Back
                </button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex gap-8 text-sm text-ios-textMuted">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>24/7 AI Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Smart Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Free Trial</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
