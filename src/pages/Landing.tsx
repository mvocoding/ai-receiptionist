import React, { useEffect } from 'react';

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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/20 via-black to-cyan-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMTExMTEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2MjBoMlYzNGgtMnpNMjQgMjR2MmgxMnYtMmgtMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-32">
          {/* Logo and nav */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                <span className="text-lg font-bold">FS</span>
              </div>
              <span className="text-xl font-semibold">Fade Station</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="index.html"
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Recordings
              </a>
              <a
                href="communications.html"
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Messages
              </a>
              <a
                href="barbers.html"
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Barbers
              </a>
              <a
                href="training.html"
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Training
              </a>
              <a
                href="flow.html"
                className="text-sm text-ios-textMuted hover:text-white transition"
              >
                Flow
              </a>
              <a
                href="demo.html"
                className="px-4 py-2 rounded-xl text-sm bg-emerald-500/90 hover:bg-emerald-500 transition shadow-lg"
              >
                Try Demo
              </a>
            </div>
          </nav>

          {/* Hero content */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Never Miss a Call
              <span className="block text-4xl md:text-5xl bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent mt-2">
                AI Receptionist for Your Barbershop
              </span>
            </h1>
            <p className="text-xl text-ios-textMuted mb-10 max-w-2xl mx-auto">
              Answer calls 24/7, book appointments, answer FAQs, and handle
              customer inquiries—all with natural AI conversation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition shadow-lg shadow-cyan-500/30">
                Start Free Trial
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium bg-white/10 border border-white/20 hover:bg-white/15 transition backdrop-blur-md">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative max-w-md mx-auto">
            <div className="relative bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-[3rem] p-6 shadow-glow backdrop-blur-2xl">
              {/* Phone screen */}
              <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="h-12 flex items-center justify-center bg-white/5 border-b border-white/10">
                  <div className="w-32 h-6 rounded-full bg-white/10"></div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Incoming call */}
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-xl">
                      📞
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Jordan Smith</h3>
                      <p className="text-xs text-ios-textMuted">
                        +64 21 555 1024
                      </p>
                      <span className="text-[10px] text-emerald-400">
                        AI Assistant Active
                      </span>
                    </div>
                  </div>
                  {/* Chat bubbles */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-full bg-white/10"></div>
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3">
                        <p className="text-xs">
                          Hi, can I book a fade for this Friday?
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3">
                        <p className="text-xs">
                          Hello! I'd be happy to help. What time works for you?
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">
                        🤖
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-ios-textMuted max-w-2xl mx-auto">
            Everything your customers need, automated with AI intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-2xl p-6 shadow-glow">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/30 flex items-center justify-center mb-4 text-2xl">
              🎯
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Call Handling</h3>
            <p className="text-ios-textMuted leading-relaxed">
              Automatically answers every call, understands customer intent, and
              provides helpful responses in natural conversation.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-2xl p-6 shadow-glow">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 text-2xl">
              📅
            </div>
            <h3 className="text-xl font-semibold mb-3">Automatic Bookings</h3>
            <p className="text-ios-textMuted leading-relaxed">
              Seamlessly checks availability, books appointments, sends
              confirmations—all without human intervention.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-2xl p-6 shadow-glow">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-4 text-2xl">
              📊
            </div>
            <h3 className="text-xl font-semibold mb-3">Complete Dashboard</h3>
            <p className="text-ios-textMuted leading-relaxed">
              View all calls, transcripts, sentiments, and insights in one
              beautiful, organized dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium mb-6">
              24/7 Availability
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Always Available for Your Customers
            </h2>
            <p className="text-lg text-ios-textMuted mb-8 leading-relaxed">
              Never miss a booking opportunity. Our AI handles calls while
              you're busy, after hours, or on days off.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Instant Responses</h4>
                  <p className="text-sm text-ios-textMuted">
                    Zero wait time for your customers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Missed Call Recovery</h4>
                  <p className="text-sm text-ios-textMuted">
                    Every call gets a callback or SMS
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Smart Escalation</h4>
                  <p className="text-sm text-ios-textMuted">
                    Complex queries routed to humans
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-2xl p-6 shadow-glow">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                    24/7
                  </div>
                  <div className="text-xs text-ios-textMuted mt-1">
                    Availability
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    98%
                  </div>
                  <div className="text-xs text-ios-textMuted mt-1">
                    Accuracy
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    &lt;3s
                  </div>
                  <div className="text-xs text-ios-textMuted mt-1">
                    Response Time
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    100+
                  </div>
                  <div className="text-xs text-ios-textMuted mt-1">
                    Happy Barbershops
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-3xl p-12 shadow-glow text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Transform Your Barbershop?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition shadow-lg shadow-cyan-500/30">
              Start Free Trial
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium bg-white/10 border border-white/20 hover:bg-white/15 transition">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
