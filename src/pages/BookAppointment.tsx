import React, { useState, useMemo, useEffect } from 'react';
import NavBar from '../components/NavBar';
import {
  supabase,
  type Barber as DBBarber,
  type Appointment as DBAppointment,
} from '../lib/supabase';

type Barber = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  price: number;
};

type BookingForm = {
  barberId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  notes: string;
};

const defaultBanner =
  'https://images.unsplash.com/photo-1585191905284-8645af60f856?auto=format&fit=crop&q=80&w=800';
const defaultAddress = '1 Fern Court, Parafield Gardens, SA 5107';
const defaultHours =
  'Mon-Fri: 9:00 AM - 6:00 PM\nSat: 9:00 AM - 5:00 PM\nSun: Closed';
const defaultPhone = '0483 804 500';
const defaultIntro = 'Premium Barbershop Experience';
const barberAvatarFallback =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200';

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
];

function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function BookAppointment(): JSX.Element {
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [bookingStatus, setBookingStatus] = useState<
    'idle' | 'submitting' | 'success'
  >('idle');
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [form, setForm] = useState<BookingForm>({
    barberId: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    notes: '',
  });
  const [storeDetails, setStoreDetails] = useState({
    bannerUrl: defaultBanner,
    hours: defaultHours,
    address: defaultAddress,
    phone: defaultPhone,
    intro: defaultIntro,
  });

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const { data, error } = await supabase
          .from('barbers')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          setBarbers(
            data.map((b: DBBarber) => ({
              id: b.id,
              name: b.name,
              specialty: b.specialty,
              image: b.image,
              price: Number(b.price),
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching barbers:', err);
      } finally {
        setLoadingBarbers(false);
      }
    };

    fetchBarbers();
  }, []);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setStoreDetails({
            bannerUrl: data.banner_url || defaultBanner,
            hours: data.hours || defaultHours,
            address: data.address || defaultAddress,
            phone: data.phone_number || defaultPhone,
            intro: data.intro_text || defaultIntro,
          });
        }
      } catch (err) {
        console.warn('Failed to load store settings for booking page:', err);
      }
    };

    fetchStoreDetails();
  }, []);

  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  const todayISO = formatDateToISO(today);
  const tomorrowISO = formatDateToISO(tomorrow);

  useEffect(() => {
    async function fetchBookedSlots() {
      if (!form.date || !form.barberId) {
        setBookedSlots([]);
        return;
      }

      setSlotsLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('slot_time, status')
          .eq('barber_id', form.barberId)
          .eq('appointment_date', form.date)
          .not('status', 'eq', 'cancelled');

        if (error) throw error;
        setBookedSlots(
          (data as DBAppointment[] | null)?.map((a) => a.slot_time) || []
        );
      } catch (err) {
        console.error('Error loading appointments:', err);
        setBookedSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }

    fetchBookedSlots();
  }, [form.date, form.barberId]);

  const handleSelectBarber = (barberId: string) => {
    setSelectedBarber(barberId);
    setForm((prev) => ({ ...prev, barberId, date: '', time: '' }));
    setBookedSlots([]);
  };

  const handleSelectDate = (dateStr: string) => {
    setForm((prev) => ({ ...prev, date: dateStr, time: '' }));
  };

  const handleSelectTime = (timeStr: string) => {
    setForm((prev) => ({ ...prev, time: timeStr }));
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!form.name.trim() || !form.phone.trim()) {
      setBookingError('Please fill in all required fields.');
      return;
    }

    if (!form.barberId || !form.date || !form.time) {
      setBookingError('Please select barber, date, and time.');
      return;
    }

    if (bookedSlots.includes(form.time)) {
      setBookingError(
        'This time slot was just booked. Please pick another one.'
      );
      return;
    }

    setBookingStatus('submitting');
    try {
      const { error } = await supabase.from('appointments').insert({
        barber_id: form.barberId,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        appointment_date: form.date,
        slot_time: form.time,
        status: 'booked',
        notes: form.notes.trim() || null,
      });

      if (error) throw error;

      setBookingStatus('success');
      setBookedSlots((prev) => [...prev, form.time]);
      setTimeout(() => {
        setBookingStatus('idle');
        setSelectedBarber(null);
        setForm({
          barberId: '',
          date: '',
          time: '',
          name: '',
          phone: '',
          notes: '',
        });
      }, 1500);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setBookingError('Failed to confirm booking. Please try again.');
      setBookingStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* unified nav */}
      <NavBar />

      <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-xl overflow-hidden">
              <img
                src={storeDetails.bannerUrl}
                alt="Fade Station Barbershop"
                className="w-full h-96 object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = defaultBanner;
                }}
              />
            </div>

            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold tracking-tight mb-2">
                  Fade Station
                </h1>
                <p className="text-xl text-white/60">{storeDetails.intro}</p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-sky-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">HOURS</p>
                    {storeDetails.hours.split('\n').map((line) => (
                      <p key={line} className="text-white/80">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">ADDRESS</p>
                    {storeDetails.address.split('\n').map((line, idx) => (
                      <p
                        key={`${line}-${idx}`}
                        className={`text-white/${idx === 0 ? '90' : '70'} ${
                          idx === 0 ? '' : 'mb-2'
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-cyan-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">CONTACT</p>
                    <a
                      href={`tel:${storeDetails.phone.replace(/\s+/g, '')}`}
                      className="text-sky-400 hover:text-sky-300 text-lg font-medium"
                    >
                      {storeDetails.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-4">
          <h2 className="text-4xl font-bold tracking-tight mb-3">
            Book Your Appointment
          </h2>
          <p className="text-xl text-white/60">
            Select a barber and choose your preferred date and time
          </p>
        </div>

        <div className="mb-16">
          <div className="grid md:grid-cols-3 gap-4">
            {loadingBarbers && (
              <div className="col-span-full text-center text-white/60">
                Loading barbers...
              </div>
            )}
            {!loadingBarbers && barbers.length === 0 && (
              <div className="col-span-full text-center text-white/60">
                No barbers found.
              </div>
            )}
            {barbers.map((barber) => (
              <button
                key={barber.id}
                onClick={() => handleSelectBarber(barber.id)}
                className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
                  selectedBarber === barber.id
                    ? 'ring-2 ring-sky-500 scale-105'
                    : 'hover:scale-102'
                }`}
              >
                <div
                  className={`relative bg-white/5 border border-white/10 rounded-xl p-6 transition-all ${
                    selectedBarber === barber.id
                      ? 'border-sky-500/50 bg-sky-500/10'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <img
                    src={barber.image}
                    alt={barber.name}
                    className="w-16 h-16 rounded-lg mb-4 object-cover border border-white/10"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        barberAvatarFallback;
                    }}
                  />
                  <div className="text-left">
                    <h4 className="text-lg font-semibold">{barber.name}</h4>
                    <p className="text-sm text-white/60 mb-3">
                      {barber.specialty}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sky-400 font-medium">
                        From ${barber.price}
                      </span>
                      {selectedBarber === barber.id && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedBarber && (
          <div className="mb-12">
            <div className="mb-12">
              <h3 className="text-lg font-semibold mb-6 text-white/90">
                Select Date
              </h3>
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => handleSelectDate(todayISO)}
                  className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                    form.date === todayISO
                      ? 'bg-sky-500 text-white shadow-lg'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm text-white/70">Today</div>
                  <div className="text-lg">{formatDateDisplay(todayISO)}</div>
                </button>
                <button
                  onClick={() => handleSelectDate(tomorrowISO)}
                  className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                    form.date === tomorrowISO
                      ? 'bg-sky-500 text-white shadow-lg'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm text-white/70">Tomorrow</div>
                  <div className="text-lg">
                    {formatDateDisplay(tomorrowISO)}
                  </div>
                </button>
              </div>
            </div>

            {form.date && (
              <div className="mb-12">
                <h3 className="text-lg font-semibold mb-6 text-white/90">
                  Select Time
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => !isBooked && handleSelectTime(slot)}
                        disabled={isBooked || slotsLoading}
                        className={`px-3 py-3 rounded-lg font-medium transition-all ${
                          isBooked
                            ? 'bg-rose-500/20 border border-rose-400/40 text-rose-200 cursor-not-allowed'
                            : form.time === slot
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                {slotsLoading && (
                  <p className="text-xs text-white/50 mt-2">
                    Checking latest availability...
                  </p>
                )}
              </div>
            )}

            {form.date && form.time && (
              <button
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    name: '',
                    phone: '',
                    notes: '',
                  }))
                }
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Continue to Details →
              </button>
            )}
          </div>
        )}
      </div>

      {selectedBarber && form.date && form.time && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-2xl max-w-md w-full backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Confirm Booking</h3>
              <button
                onClick={() =>
                  setForm((prev) => ({ ...prev, date: '', time: '' }))
                }
                className="text-white/60 hover:text-white text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  placeholder="0483 234 567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  rows={2}
                  placeholder="Any special requests?"
                />
              </div>

              {bookingError && (
                <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                  {bookingError}
                </div>
              )}
              {bookingStatus === 'success' && (
                <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                  Booking confirmed! Sending you back to the booking screen…
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 my-6">
                <p className="text-xs text-white/60 uppercase tracking-wide mb-2">
                  Appointment Summary
                </p>
                <p className="text-lg font-semibold">
                  {barbers.find((b) => b.id === form.barberId)?.name}
                </p>
                <p className="text-white/70 text-sm">
                  {formatDateDisplay(form.date)} at {form.time}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, date: '', time: '' }))
                  }
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={bookingStatus === 'submitting'}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingStatus === 'submitting'
                    ? 'Booking...'
                    : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
