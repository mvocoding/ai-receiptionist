import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function CheckboxIcon(): JSX.Element {
  return (
    <svg
      className="w-5 h-5 text-emerald-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

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
  const [loading, setLoading] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const DEFAULT_PASSWORD = '0123456789';

  async function startOtpFlow(trimmed: string) {
    setError(null);
    setInfo(null);
    setNeedsEmailConfirmation(false);
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        const message = otpError.message?.toLowerCase() ?? '';

        if (message.includes('user not found')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: trimmed,
            password: DEFAULT_PASSWORD,
          });

          if (signUpError) throw signUpError;

          setNeedsEmailConfirmation(true);
          setInfo(
            `We created an account for ${trimmed}. Please confirm your email from the Supabase message, then click "I confirmed my email" below.`
          );
          return;
        }

        if (message.includes('email not confirmed')) {
          setNeedsEmailConfirmation(true);
          setInfo(
            `Please confirm ${trimmed} using the Supabase email, then click "I confirmed my email".`
          );
          return;
        }

        throw otpError;
      }

      sessionStorage.setItem('fs_signin_email', trimmed);

      setInfo(
        `A 8-digit verification code was sent to ${trimmed}. Please check your email.`
      );

      setTimeout(() => {
        (window as any).__navigate?.('/confirm') ??
          (window.location.pathname = '/confirm');
      }, 1500);
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    await startOtpFlow(trimmed);
  }

  async function handleConfirmedEmail() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    await startOtpFlow(trimmed);
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl">
        <div className="bg-gradient-to-b from-[#0b0b0b]/95 to-[#0d0d0d]/95 backdrop-blur-xl border border-ios-border rounded-3xl p-12 shadow-glow">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Welcome to Fade Station
            </h1>
            <p className="text-lg text-ios-textMuted mb-8">
              Enter your email to get started
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

              {needsEmailConfirmation && (
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 space-y-3">
                  <p className="text-sm text-ios-textMuted">
                    After confirming your email, click below to continue.
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmedEmail}
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Checking...' : 'I confirmed my email'}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition shadow-lg shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Continue with Email'}
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
                  <CheckboxIcon />
                  <span>24/7 AI Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckboxIcon />
                  <span>Smart Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckboxIcon />
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
