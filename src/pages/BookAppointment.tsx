import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import {
  supabase,
  type Barber as DBBarber,
  type Appointment as DBAppointment,
  type BarberException as DBBarberException,
} from '../lib/supabase';

function formatIso(date: Date) {
  return date.toISOString().split('T')[0];
}

function cutTime(time?: string | null) {
  if (!time) return '';
  return time.slice(0, 5);
}

function addMinutes(time: string, minute: number) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minute;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}:00`;
}

async function ensureUser(name: string, phone: string): Promise<string | null> {
  const phoneClean = phone.replace(/\s+/g, '');
  if (!phoneClean) return null;
  const { data: existed, error } = await supabase
    .from('users')
    .select('id, name')
    .eq('phone_number', phoneClean)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  if (existed) {
    if (name && existed.name !== name) {
      await supabase.from('users').update({ name }).eq('id', existed.id);
    }
    return existed.id;
  }
  const { data: inserted, error: insertError } = await supabase
    .from('users')
    .insert({ phone_number: phoneClean, name: name || null })
    .select('id')
    .single();
  if (insertError) throw insertError;
  return inserted.id;
}

function createSlotAllowMap(exc: ExceptionInfo) {
  if (!exc || (!exc.start && !exc.end)) {
    return new Set(slotList);
  }
  if (exc.isDayOff) return new Set<string>();
  const allow = new Set<string>();
  slotList.forEach((slot) => {
    if (!exc.start || !exc.end || (slot >= exc.start && slot <= exc.end)) {
      allow.add(slot);
    }
  });
  return allow;
}

function InfoRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-white/60 mb-1">{title}</p>
      <div className="text-white/80 text-sm space-y-1">{children}</div>
    </div>
  );
}

const slotList = [
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

const fallbackStore = {
  bannerUrl:
    'https://images.unsplash.com/photo-1585191905284-8645af60f856?auto=format&fit=crop&q=80&w=800',
  intro: 'Welcome to Fade Station. Premium Barbershop Experience.',
  hours: 'Mon-Fri: 9:00 AM - 6:00 PM\nSat: 9:00 AM - 5:00 PM\nSun: Closed',
  address: '1 Fern Court, Parafield Gardens, SA 5107',
  phone: '0483 804 500',
};

type BarberView = {
  id: string;
  name: string;
  desc: string;
  status: 'active' | 'inactive';
};

type ExceptionInfo = {
  isDayOff: boolean;
  start?: string;
  end?: string;
} | null;

type BookingForm = {
  barberId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  notes: string;
};

export default function BookAppointment(): JSX.Element {
  const [storeInfo, setStoreInfo] = useState(fallbackStore);
  const [barberList, setBarberList] = useState<BarberView[]>([]);
  const [busyBarber, setBusyBarber] = useState(true);
  const [busySlot, setBusySlot] = useState(false);
  const [slotTaken, setSlotTaken] = useState<string[]>([]);
  const [dayException, setDayException] = useState<ExceptionInfo>(null);
  const [bookState, setBookState] = useState<'idle' | 'saving' | 'done'>(
    'idle'
  );
  const [bookError, setBookError] = useState<string | null>(null);

  const [form, setForm] = useState<BookingForm>({
    barberId: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    async function loadStore() {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .single();
        if (error) throw error;
        if (data) {
          setStoreInfo({
            bannerUrl: data.banner_url || fallbackStore.bannerUrl,
            intro: data.intro_text || fallbackStore.intro,
            hours: data.hours || fallbackStore.hours,
            address: data.address || fallbackStore.address,
            phone: data.phone_number || fallbackStore.phone,
          });
        }
      } catch {
        // keep fallback
      }
    }

    async function loadBarber() {
      setBusyBarber(true);
      try {
        const { data, error } = await supabase
          .from('barbers')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        setBarberList(
          (data as DBBarber[] | null)?.map((item) => ({
            id: item.id,
            name: item.name,
            desc: item.description || '',
            status: (item.status as 'active' | 'inactive') || 'inactive',
          })) || []
        );
      } catch (err) {
        console.error('load barber fail', err);
        setBarberList([]);
      } finally {
        setBusyBarber(false);
      }
    }

    void loadStore();
    void loadBarber();
  }, []);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    async function loadSlots() {
      if (!form.barberId || !form.date) {
        setSlotTaken([]);
        setDayException(null);
        return;
      }

      setBusySlot(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('start_time, status')
          .eq('barber_id', form.barberId)
          .eq('appointment_date', form.date)
          .not('status', 'eq', 'cancelled');
        if (error) throw error;
        const busy =
          (data as DBAppointment[] | null)?.map((item) =>
            cutTime(item.start_time)
          ) || [];
        setSlotTaken(busy);

        const { data: exData, error: exError } = await supabase
          .from('barber_exceptions')
          .select('*')
          .eq('barber_id', form.barberId)
          .eq('exception_date', form.date)
          .maybeSingle<DBBarberException>();
        if (exError && exError.code !== 'PGRST116') throw exError;
        if (exData) {
          setDayException({
            isDayOff: exData.is_day_off,
            start: cutTime(exData.start_time),
            end: cutTime(exData.end_time),
          });
        } else {
          setDayException(null);
        }
      } catch (err) {
        console.error('load slots fail', err);
        setSlotTaken([]);
        setDayException(null);
      } finally {
        setBusySlot(false);
      }
    }

    void loadSlots();
  }, [form.barberId, form.date]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setBookError(null);
    if (
      !form.barberId ||
      !form.date ||
      !form.time ||
      !form.name.trim() ||
      !form.phone.trim()
    ) {
      setBookError('Please fill all required information.');
      return;
    }
    if (slotTaken.includes(form.time)) {
      setBookError('Slot already taken, please choose another time.');
      return;
    }

    setBookState('saving');
    try {
      const userId = await ensureUser(form.name.trim(), form.phone.trim());
      const { error } = await supabase.from('appointments').insert({
        barber_id: form.barberId,
        user_id: userId,
        appointment_date: form.date,
        start_time: `${form.time}:00`,
        end_time: addMinutes(form.time, 30),
        status: 'booked',
        note: form.notes.trim() || null,
        created_by: 'public',
      });
      if (error) throw error;
      setBookState('done');
      setSlotTaken((prev) => [...prev, form.time]);
      setTimeout(() => {
        setBookState('idle');
        setForm({
          barberId: '',
          date: '',
          time: '',
          name: '',
          phone: '',
          notes: '',
        });
      }, 1400);
    } catch (err) {
      console.error('book fail', err);
      setBookState('idle');
      setBookError('Failed to save booking. Try again later.');
    }
  }

  const barberSelected = barberList.find((b) => b.id === form.barberId);
  const slotAllowed = createSlotAllowMap(dayException);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />

      <header className="bg-gradient-to-b from-white/5 to-transparent border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-xl overflow-hidden">
            <img
              src={storeInfo.bannerUrl}
              alt="Fade Station"
              className="w-full h-96 object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  fallbackStore.bannerUrl;
              }}
            />
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-bold mb-3">Fade Station</h1>
              <p className="text-lg text-white/70">{storeInfo.intro}</p>
            </div>
            <InfoRow title="HOURS">
              {storeInfo.hours.split('\n').map((line) => (
                <p key={line}>{line}</p>
              ))}
            </InfoRow>
            <InfoRow title="ADDRESS">
              {storeInfo.address.split('\n').map((line, idx) => (
                <p
                  key={`${line}-${idx}`}
                  className={idx === 0 ? 'font-medium' : ''}
                >
                  {line}
                </p>
              ))}
            </InfoRow>
            <InfoRow title="CONTACT">
              <a
                href={`tel:${storeInfo.phone.replace(/\s+/g, '')}`}
                className="text-sky-400 hover:text-sky-300 text-lg font-medium"
              >
                {storeInfo.phone}
              </a>
            </InfoRow>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-16 space-y-12">
        <section>
          <h2 className="text-3xl font-semibold mb-4">Choose your barber</h2>
          {busyBarber ? (
            <p className="text-white/60">Loading barbers…</p>
          ) : barberList.length === 0 ? (
            <p className="text-white/60">No barbers available.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {barberList.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      barberId: barber.id,
                      date: '',
                      time: '',
                    }))
                  }
                  disabled={barber.status !== 'active'}
                  className={`rounded-xl border border-white/10 p-5 text-left transition ${
                    form.barberId === barber.id
                      ? 'ring-2 ring-sky-500 bg-white/5'
                      : 'bg-black/40'
                  } ${barber.status !== 'active' ? 'opacity-40' : ''}`}
                >
                  <h3 className="text-xl font-semibold">{barber.name}</h3>
                  <p className="text-sm text-white/60 mt-1">
                    {barber.desc || 'No desc'}
                  </p>
                  <p className="text-xs mt-3">
                    Status:{' '}
                    <span className="font-medium">
                      {barber.status === 'active' ? 'Available' : 'Unavailable'}
                    </span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        {form.barberId && (
          <section className="space-y-10">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Pick a day</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <input
                  type="date"
                  value={form.date}
                  min={formatIso(today)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                      time: '',
                    }))
                  }
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
                {form.date && (
                  <p className="text-white/60 text-sm">
                    Selected: {new Date(form.date + 'T00:00:00').toDateString()}
                  </p>
                )}
              </div>
            </div>

            {form.date && (
              <div>
                <h3 className="text-2xl font-semibold mb-4">Pick a time</h3>
                {dayException?.isDayOff && (
                  <p className="text-rose-300 text-sm mb-3">
                    Barber is marked as day off on this day.
                  </p>
                )}
                {!dayException?.isDayOff && dayException && (
                  <p className="text-amber-200 text-sm mb-3">
                    Custom hours {dayException.start ?? '--:--'} –{' '}
                    {dayException.end ?? '--:--'}
                  </p>
                )}
                {busySlot ? (
                  <p className="text-white/60 text-sm">Checking slots…</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {slotList.map((slot) => {
                      const taken = slotTaken.includes(slot);
                      const allowed = slotAllowed.has(slot);
                      const disabled = taken || !allowed;
                      return (
                        <button
                          key={slot}
                          disabled={disabled}
                          onClick={() =>
                            setForm((prev) => ({ ...prev, time: slot }))
                          }
                          className={`px-3 py-2 rounded-lg text-sm border ${
                            taken
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                              : !allowed
                              ? 'bg-white/5 border-white/10 text-white/30 opacity-50'
                              : form.time === slot
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {form.date && form.time && (
              <form
                onSubmit={handleBook}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <h3 className="text-2xl font-semibold">Customer info</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">
                      Full name *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                      placeholder="Nguyen Van A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">
                      Phone *
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                      placeholder="0483 804 500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                </div>
                {bookError && (
                  <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                    {bookError}
                  </div>
                )}
                {bookState === 'done' && (
                  <div className="text-sm text-emerald-300 bg-emerald-500/10.border border-emerald-500/30 rounded-lg px-3 py-2">
                    Booking confirmed!
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, date: '', time: '' }))
                    }
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={bookState === 'saving'}
                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold disabled:opacity-50"
                  >
                    {bookState === 'saving' ? 'Booking…' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
