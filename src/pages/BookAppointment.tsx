import React, { useState } from 'react';

type Barber = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  nextSlot: string;
  price: number;
};

type BookingForm = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const BARBERS: Barber[] = [
  {
    id: 'ace',
    name: 'Ace',
    specialty: 'Fades · Beard · Kids',
    image:
      'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&q=80&w=200&h=200',
    nextSlot: '2:30 PM Today',
    price: 45,
  },
  {
    id: 'jay',
    name: 'Jay',
    specialty: 'Tapers · Line-ups',
    image:
      'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=80&w=200&h=200',
    nextSlot: '10:00 AM Tomorrow',
    price: 40,
  },
  {
    id: 'mia',
    name: 'Mia',
    specialty: 'Skin Fades · Scissor',
    image:
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=200&h=200',
    nextSlot: '3:00 PM Today',
    price: 45,
  },
];

export default function BookAppointment(): JSX.Element {
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [form, setForm] = useState<BookingForm>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: Show success and clear form
    alert(
      `Booking confirmed with ${selectedBarber?.name} for ${selectedBarber?.nextSlot}`
    );
    setSelectedBarber(null);
    setForm({ name: '', email: '', phone: '', notes: '' });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/20 via-black to-cyan-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMTExMTEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2MjBoMlYzNGgtMnpNMjQgMjR2MmgxMnYtMmgtMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book Your Next Cut
            </h1>
            <p className="text-xl text-ios-textMuted max-w-2xl mx-auto">
              Choose your preferred barber and time. We'll have you looking
              fresh in no time.
            </p>
          </div>

          {/* Barber cards grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {BARBERS.map((barber) => (
              <div
                key={barber.id}
                className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-2xl p-6 shadow-glow"
              >
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-24 h-24 rounded-xl mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold mb-1">{barber.name}</h3>
                <p className="text-ios-textMuted text-sm mb-4">
                  {barber.specialty}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-ios-textMuted">Next available:</span>
                    <br />
                    <span className="text-emerald-400">{barber.nextSlot}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-ios-textMuted text-sm">From</span>
                    <br />
                    <span className="text-xl font-semibold">
                      ${barber.price}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBarber(barber)}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {selectedBarber && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-[#0b0b0b] to-[#0d0d0d] border border-ios-border rounded-2xl p-6 shadow-glow max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Book with {selectedBarber.name}
              </h3>
              <button
                onClick={() => setSelectedBarber(null)}
                className="text-ios-textMuted hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm text-ios-textMuted mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-ios-border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-ios-textMuted mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-ios-border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-ios-textMuted mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white/5 border border-ios-border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-ios-textMuted mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-white/5 border border-ios-border rounded-xl px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm">
                  <p className="text-ios-textMuted">Appointment time:</p>
                  <p className="font-medium">{selectedBarber.nextSlot}</p>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
