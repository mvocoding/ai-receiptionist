import React, { useEffect } from 'react';
import NavBar from '../components/NavBar';

export default function Landing(): JSX.Element {
  useEffect(() => {
    document.title = 'Fade Station · AI Receptionist';
    const meta =
      document.querySelector('meta[name="description"]') ||
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute(
      'content',
      'Intelligent AI Receptionist for Your Barbershop · Never Miss a Call'
    );
    if (!document.querySelector('meta[name="description"]'))
      document.head.appendChild(meta);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/20 via-black to-cyan-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMTExMTEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2MjBoMlYzNGgtMnpNMjQgMjR2MmgxMnYtMmgtMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Never Miss a Call
              <span className="block text-4xl md:text-5xl bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent mt-2">
                AI Receptionist for Your Barbershop
              </span>
            </h1>
            <p className="text-xl text-ios-textMuted mb-10 max-w-2xl mx-auto">
              Answer calls 24/7, book appointments, answer FAQs, and handle
              customer inquiries
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  (window as any).__navigate?.('/signin');
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition shadow-lg shadow-cyan-500/30"
              >
                Start Free Trial
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  (window as any).__navigate?.('/book');
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium bg-white/10 border border-white/20 hover:bg-white/15 transition backdrop-blur-md"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-ios-textMuted max-w-2xl mx-auto">
            Everything your customers need, automated with AI intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-2xl p-6 shadow-glow">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/30 flex items-center justify-center mb-4 text-2xl">
              🎯
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Call Handling</h3>
            <p className="text-ios-textMuted leading-relaxed">
              Automatically answers every call, understands customer intent, and
              provides helpful responses.
            </p>
          </div>

          <div className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-2xl p-6 shadow-glow">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 text-2xl">
              📅
            </div>
            <h3 className="text-xl font-semibold mb-3">Automatic Bookings</h3>
            <p className="text-ios-textMuted leading-relaxed">
              Seamlessly checks availability, books appointments, sends
              confirmations.
            </p>
          </div>

          <div className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-2xl p-6 shadow-glow">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center mb-4 text-2xl">
              📁
            </div>
            <h3 className="text-xl font-semibold mb-3">Customer Records</h3>
            <p className="text-ios-textMuted leading-relaxed">
              Every caller is saved automatically, so you can track customer
              details, history, and interactions in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-3xl p-12 shadow-glow text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Transform Your Barbershop?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                (window as any).__navigate?.('/signin');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition shadow-lg shadow-cyan-500/30"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
