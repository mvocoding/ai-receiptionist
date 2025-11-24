import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminConfirmCode(): JSX.Element | null {
  useEffect(() => {
    document.title = 'Admin Confirm Code · Fade Station';
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute(
      'content',
      'Enter the 8-digit code sent to your email to sign in as admin.'
    );
    if (!document.querySelector('meta[name="description"]'))
      document.head.appendChild(meta);
  }, []);

  const [email, setEmail] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('fs_admin_signin_email');
    if (!storedEmail) {
      (window as any).__navigate?.('/admin/signin') ??
        (window.location.pathname = '/admin/signin');
      return;
    }
    setEmail(storedEmail);
  }, []);

  async function upsertUserProfile(authUserId: string, userEmail: string) {
    const { error: upsertError } = await supabase.from('users').upsert(
      {
        id: authUserId,
        email: userEmail,
        last_login_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (upsertError) throw upsertError;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email) return;

    if (!/^\d{6,8}$/.test(codeInput)) {
      setError('Enter the numeric code from your email (6-8 digits).');
      return;
    }

    setVerifying(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: codeInput,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      const authUser = data.user;

      if (!authUser) {
        setError('Verification succeeded but user data is missing.');
        return;
      }

      await upsertUserProfile(authUser.id, authUser.email ?? email);

      const sessionUser = {
        id: authUser.id,
        email: authUser.email ?? email,
        loggedAt: Date.now(),
        isAdmin: true,
      };
      localStorage.setItem('fs_user', JSON.stringify(sessionUser));
      sessionStorage.removeItem('fs_admin_signin_email');

      (window as any).__navigate?.('/admin') ??
        (window.location.pathname = '/admin');
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Failed to verify code. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  async function resendCode() {
    if (!email) return;
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (otpError) throw otpError;

      setInfo(`A new code was sent to ${email}. Please check your email.`);
    } catch (err) {
      console.error('Error resending code:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md bg-gradient-to-b from-[#0b0b0b] to-[#0d0d0d] border border-ios-border rounded-2xl p-6 shadow-glow">
          <div className="mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/30 flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-sky-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Admin Verification</h1>
            <p className="text-sm text-ios-textMuted mb-4">
              We sent a login code to <strong>{email}</strong>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-ios-textMuted mb-1">
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6,8}"
                maxLength={8}
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value.replace(/\D/g, ''));
                  setError(null);
                  setInfo(null);
                }}
                className="w-full bg-white/5 border border-ios-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                placeholder="Enter your code"
              />
            </div>

            {error && <div className="text-rose-400 text-sm">{error}</div>}
            {info && <div className="text-emerald-300 text-sm">{info}</div>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={verifying}
                className="flex-1 px-4 py-2 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? 'Verifying...' : 'Verify & Sign in'}
              </button>
              <button
                type="button"
                onClick={() => {
                  (window as any).__navigate?.('/admin/signin') ??
                    (window.location.pathname = '/admin/signin');
                }}
                className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                Back
              </button>
            </div>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-ios-textMuted">
            <button
              onClick={resendCode}
              disabled={loading}
              className="text-sm text-sky-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Resend code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

