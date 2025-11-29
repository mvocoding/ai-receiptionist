import React, { useState } from 'react';
import NavBar from '../components/NavBar';

const features = [
  {
    emoji: '🎯',
    title: 'Smart Call Handling',
    description:
      'Automatically answers every call, understands customer intent, and provides helpful responses.',
  },
  {
    emoji: '📅',
    title: 'Automatic Bookings',
    description:
      'Seamlessly checks availability, books appointments, sends confirmations.',
  },
  {
    emoji: '📁',
    title: 'Customer Records',
    description:
      'Every caller is saved automatically, so you can track customer details, history, and interactions in one place.',
  },
];

type SignupFormData = {
  barbershopName: string;
  ownerEmail: string;
  ownerPhone: string;
  shopSize: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function Landing(): JSX.Element {
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedShopName, setSubmittedShopName] = useState<string>('');
  const [formData, setFormData] = useState<SignupFormData>({
    barbershopName: '',
    ownerEmail: '',
    ownerPhone: '',
    shopSize: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.barbershopName.trim() || !formData.ownerEmail.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const shopName = formData.barbershopName.trim();

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSignupForm(false);
      setSubmittedShopName(shopName);
      setShowSuccess(true);

      setFormData({
        barbershopName: '',
        ownerEmail: '',
        ownerPhone: '',
        shopSize: '',
      });

      setTimeout(() => {
        setShowSuccess(false);
      }, 8000);
    }, 1000);
  };

  const handleCloseForm = () => {
    setShowSignupForm(false);
    setFormData({
      barbershopName: '',
      ownerEmail: '',
      ownerPhone: '',
      shopSize: '',
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />

      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-6 rounded-2xl shadow-lg border border-emerald-400/30 backdrop-blur-md max-w-md">
            <div className="flex items-start gap-3">
              <div className="text-2xl mt-1">✓</div>
              <div className="flex-1">
                <p className="font-semibold text-lg mb-1">
                  Submitted Successfully!
                </p>
                <p className="text-sm text-emerald-100 mb-3">
                  We'll be in touch soon.
                </p>
                <button
                  onClick={() => {
                    const shopSlug = submittedShopName
                      ? slugify(submittedShopName)
                      : 'maxfade';
                    (window as any).__navigate?.(
                      `/admin/login?store=${shopSlug}`
                    );
                  }}
                  className="text-sm underline hover:text-emerald-50 transition"
                >
                  Go to Login →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSignupForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-[#0b0b0b] to-[#0d0d0d] border border-ios-border rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                Start Your Free Trial
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-ios-textMuted hover:text-white transition text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Barbershop Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="barbershopName"
                  value={formData.barbershopName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  placeholder="Enter your barbershop name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Owner Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Owner Phone
                  </label>
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    placeholder="0483 804 855"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Shop Size <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="shopSize"
                    value={formData.shopSize}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    <option value="">Select shop size</option>
                    <option value="small">Small (1-2 barbers)</option>
                    <option value="medium">Medium (3-5 barbers)</option>
                    <option value="large">Large (6+ barbers)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 rounded-xl text-base font-medium bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-8 py-4 rounded-xl text-base font-medium bg-white/10 border border-white/20 hover:bg-white/15 transition backdrop-blur-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/20 via-black to-cyan-900/20"></div>
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
                  setShowSignupForm(true);
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition shadow-lg shadow-cyan-500/30"
              >
                Start Free Trial
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
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-gradient-to-b from-[#0b0b0b]/95 to-[#0d0d0d]/95 backdrop-blur-xl border border-ios-border rounded-3xl p-8 shadow-glow text-center"
            >
              <div className="text-5xl mb-4">{feature.emoji}</div>
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-ios-textMuted">{feature.description}</p>
            </div>
          ))}
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
                setShowSignupForm(true);
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
