import React, { useEffect, useState } from 'react';

export default function ConfirmCode(): JSX.Element | null {
  useEffect(() => {
    document.title = 'Confirm code · Fade Station';
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute(
      'content',
      'Enter the 4-digit code sent to your email to sign in.'
    );
    if (!document.querySelector('meta[name="description"]'))
      document.head.appendChild(meta);
  }, []);

  const [stored, setStored] = useState<{
    email: string;
    code: string;
    createdAt: number;
  } | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('fs_signin');
    if (!raw) {
      // no pending signin -> go back to signin
      (window as any).__navigate?.('/signin') ??
        (window.location.pathname = '/signin');
      return;
    }
    try {
      const obj = JSON.parse(raw);
      setStored(obj);
    } catch {
      sessionStorage.removeItem('fs_signin');
      (window as any).__navigate?.('/signin') ??
        (window.location.pathname = '/signin');
    }
  }, []);

  function completeLogin() {
    if (!stored) return;
    const user = { email: stored.email, loggedAt: Date.now() };
    localStorage.setItem('fs_user', JSON.stringify(user));
    // clear session code
    sessionStorage.removeItem('fs_signin');
    // navigate into app (recordings)
    (window as any).__navigate?.('/recordings') ??
      (window.location.pathname = '/recordings');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!stored) return;
    if (!/^\d{4}$/.test(codeInput)) {
      setError('Enter the 4-digit numeric code.');
      return;
    }
    if (codeInput === stored.code) {
      completeLogin();
    } else {
      setError('Incorrect code. Try again or resend.');
    }
  }

  function resendCode() {
    if (!stored) return;
    const newCode = String(Math.floor(1000 + Math.random() * 9000));
    const payload = { ...stored, code: newCode, createdAt: Date.now() };
    sessionStorage.setItem('fs_signin', JSON.stringify(payload));
    setStored(payload);
    setInfo(`A new code was sent to ${payload.email}. (Check console in demo)`);
    // eslint-disable-next-line no-console
    console.info(
      'Resent sign-in code (simulate email):',
      newCode,
      'for',
      payload.email
    );
  }

  if (!stored) {
    return null; // redirecting
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-[#0b0b0b] to-[#0d0d0d] border border-ios-border rounded-2xl p-6 shadow-glow">
        <h1 className="text-2xl font-bold mb-2">Enter verification code</h1>
        <p className="text-sm text-ios-textMuted mb-4">
          We sent a 4-digit code to <strong>{stored.email}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-ios-textMuted mb-1">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                setError(null);
                setInfo(null);
              }}
              className="w-full bg-white/5 border border-ios-border rounded-xl px-3 py-2 text-sm focus:outline-none"
              placeholder="1234"
            />
          </div>

          {error && <div className="text-rose-400 text-sm">{error}</div>}
          {info && <div className="text-emerald-300 text-sm">{info}</div>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 transition"
            >
              Verify & Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                (window as any).__navigate?.('/signin') ??
                  (window.location.pathname = '/signin');
              }}
              className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10"
            >
              Back
            </button>
          </div>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-ios-textMuted">
          <button
            onClick={resendCode}
            className="text-sm text-sky-400 hover:underline"
          >
            Resend code
          </button>
          <span>Need help? Contact support</span>
        </div>
      </div>
    </div>
  );
}
