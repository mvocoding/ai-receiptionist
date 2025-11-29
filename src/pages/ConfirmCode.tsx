import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { supabase } from '../lib/supabase';

export default function ConfirmCode(): JSX.Element | null {
  const [email, setEmail] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('fs_signin_email');
    if (!storedEmail) {
      (window as any).gotopage?.('/signin') ??
        (window.location.pathname = '/signin');
      return;
    }
    setEmail(storedEmail);
  }, []);

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

      const sessionUser = {
        id: authUser.id,
        email: authUser.email ?? email,
        loggedAt: Date.now(),
      };
      localStorage.setItem('fs_user', JSON.stringify(sessionUser));
      sessionStorage.removeItem('fs_signin_email');

      (window as any).gotopage?.('/admin/dashboard') ??
        (window.location.pathname = '/admin/dashboard');
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
      <NavBar />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-b from-[#0b0b0b] to-[#0d0d0d] border border-ios-border rounded-2xl p-6 shadow-glow">
          <h1 className="text-2xl font-bold mb-2">Enter verification code</h1>
          <p className="text-sm text-ios-textMuted mb-4">
            We sent a login code to <strong>{email}</strong>.
          </p>

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
                className="w-full bg-white/5 border border-ios-border rounded-xl px-3 py-2 text-sm focus:outline-none"
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
                  (window as any).gotopage?.('/signin') ??
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
