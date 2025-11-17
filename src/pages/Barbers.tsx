import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import {
  supabase,
  type Barber as DBBarber,
  type Appointment as DBAppointment,
} from '../lib/supabase';

type BarberCard = {
  id: string;
  name: string;
  services: string;
  image: string;
  price: number;
  workingDays: string[];
};

function formatDateDisplay(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

const defaultAvatar =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200';

const fallbackBarbers: BarberCard[] = [
  {
    id: 'fallback-ace',
    name: 'Ace',
    services: 'Fades · Beard · Kids',
    image:
      'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&q=80&w=200&h=200',
    price: 45,
    workingDays: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
  },
  {
    id: 'fallback-jay',
    name: 'Jay',
    services: 'Tapers · Line-ups',
    image:
      'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=80&w=200&h=200',
    price: 40,
    workingDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
  },
  {
    id: 'fallback-mia',
    name: 'Mia',
    services: 'Skin Fades · Scissor',
    image:
      'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=200&h=200',
    price: 45,
    workingDays: [
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
  },
];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function toTimeString(mins: number) {
  const h = Math.floor(mins / 60),
    m = mins % 60;
  return `${pad(h)}:${pad(m)}`;
}
function generateSlots(open: string, close: string, stepMin: number) {
  const start = parseTime(open),
    end = parseTime(close);
  const slots: string[] = [];
  for (let m = start; m < end; m += stepMin) slots.push(toTimeString(m));
  return slots;
}

export default function Barbers(): JSX.Element {
  useEffect(() => {
    document.title = 'Fade Station · Barbers';
    const meta =
      document.querySelector('meta[name="description"]') ||
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute(
      'content',
      'Fade Station AI Receptionist · Barbers availability and booking slots'
    );
    if (!document.querySelector('meta[name="description"]'))
      document.head.appendChild(meta);
  }, []);

  const [date, setDate] = useState<Date>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [barbers, setBarbers] = useState<BarberCard[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [appointmentsByBarber, setAppointmentsByBarber] = useState<
    Record<string, DBAppointment[]>
  >({});
  const [activeAppointment, setActiveAppointment] = useState<{
    data: DBAppointment;
    barberName: string;
    barberServices: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<
    Record<string, Set<string>>
  >({}); // ui-only selections

  const state = useMemo(
    () => ({ open: '09:00', close: '18:00', stepMin: 30 }),
    []
  );

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const { data, error: barbersError } = await supabase
          .from('barbers')
          .select('*')
          .order('created_at', { ascending: true });

        if (barbersError) throw barbersError;

        if (!data || data.length === 0) {
          setBarbers(fallbackBarbers);
          return;
        }

        setBarbers(
          data.map((b: DBBarber) => ({
            id: b.id,
            name: b.name,
            services: b.specialty,
            image: b.image,
            price: Number(b.price),
            workingDays: b.working_days || [],
          }))
        );
      } catch (err) {
        console.error('Error loading barbers:', err);
        setBarbers(fallbackBarbers);
        setError('Unable to load barbers from Supabase. Showing demo data.');
      } finally {
        setLoadingBarbers(false);
      }
    };

    fetchBarbers();
  }, []);

  const dateStr = fmtDate(date);
  const allSlots = useMemo(
    () => generateSlots(state.open, state.close, state.stepMin),
    [state]
  );

  useEffect(() => {
    const fetchAppointments = async () => {
      setSlotsLoading(true);
      setError(null);
      try {
        const { data, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq('appointment_date', dateStr)
          .not('status', 'eq', 'cancelled');

        if (appointmentsError) throw appointmentsError;

        const grouped: Record<string, DBAppointment[]> = {};
        (data as DBAppointment[] | null)?.forEach((appt) => {
          if (!grouped[appt.barber_id]) grouped[appt.barber_id] = [];
          grouped[appt.barber_id].push(appt);
        });

        setAppointmentsByBarber(grouped);
      } catch (err) {
        console.error('Error loading appointments:', err);
        setError('Unable to load appointments for this date.');
        setAppointmentsByBarber({});
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAppointments();
  }, [dateStr]);

  function toggleSelect(barberId: string, slot: string) {
    setSelectedSlots((prev) => {
      const next = { ...prev };
      if (!next[barberId]) next[barberId] = new Set();
      if (next[barberId].has(slot)) next[barberId].delete(slot);
      else next[barberId].add(slot);
      return next;
    });
  }

  function handlePrevDay() {
    setDate((d) => new Date(d.getTime() - 86400000));
  }
  function handleNextDay() {
    setDate((d) => new Date(d.getTime() + 86400000));
  }
  function handleDateChange(v: string) {
    const d = new Date(v + 'T00:00:00');
    if (!isNaN(d.getTime())) setDate(d);
  }

  const visibleBarbers =
    selectedBarber === 'all'
      ? barbers
      : barbers.filter((b) => b.id === selectedBarber);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevDay}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
            >
              Prev
            </button>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
            <button
              onClick={handleNextDay}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
            >
              Next
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {loadingBarbers ? (
          <div className="mt-10 text-center text-ios-textMuted">
            Loading barbers…
          </div>
        ) : (
          <main className="mt-4 space-y-4" id="gridRoot">
            {visibleBarbers.length === 0 && (
              <div className="text-center py-20 bg-white/5 border border-ios-border rounded-2xl">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <svg
                    className="h-7 w-7 text-white/70"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 12h3m12 0h3M8 12h8M12 8v8" />
                  </svg>
                </div>
                <h3 className="font-semibold">No availability</h3>
                <p className="text-sm text-ios-textMuted">
                  Try a different day or barber.
                </p>
              </div>
            )}

            {visibleBarbers.map((barberInfo) => {
              const currentAppointments =
                appointmentsByBarber[barberInfo.id] || [];
              const appointmentBySlot = new Map(
                currentAppointments.map((appt) => [appt.slot_time, appt])
              );
              const selected =
                selectedSlots[barberInfo.id] || new Set<string>();
              const availableCount = allSlots.filter(
                (slot) => !appointmentBySlot.has(slot)
              ).length;
              return (
                <section
                  key={barberInfo.id}
                  className="bg-gradient-to-b from-[#111111] to-[#0d0d0d] border border-ios-border rounded-2xl shadow-glow overflow-hidden"
                >
                  <div className="p-4 flex items-start gap-3">
                    <img
                      src={barberInfo.image || defaultAvatar}
                      alt={barberInfo.name}
                      className="h-12 w-12 rounded-2xl object-cover border border-white/10 bg-white/5"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          defaultAvatar;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-sm barber-name">
                            {barberInfo.name}
                          </h3>
                          <p className="text-xs text-ios-textMuted">
                            Available slots ·{' '}
                            <span className="slot-count">{availableCount}</span>
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-2 text-[10px]">
                          <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/80 service">
                            {barberInfo.services}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {slotsLoading ? (
                          <div className="col-span-full text-xs text-ios-textMuted">
                            Loading availability…
                          </div>
                        ) : (
                          allSlots.map((s) => {
                            const appointment = appointmentBySlot.get(s);
                            const isBooked = Boolean(appointment);
                            const isSelected = selected.has(s);
                            return (
                              <button
                                key={s}
                                onClick={() => {
                                  if (appointment) {
                                    setActiveAppointment({
                                      data: appointment,
                                      barberName: barberInfo.name,
                                      barberServices: barberInfo.services,
                                    });
                                  } else {
                                    toggleSelect(barberInfo.id, s);
                                  }
                                }}
                                className={
                                  'slot-btn px-3 py-2 rounded-xl text-xs transition border ' +
                                  (isBooked
                                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-200 hover:bg-rose-500/30'
                                    : isSelected
                                    ? 'bg-emerald-500/20 border-emerald-400/40'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10')
                                }
                              >
                                {s}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </main>
        )}
      </div>

      {activeAppointment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-ios-textMuted uppercase tracking-wide">
                  Appointment
                </p>
                <h3 className="text-2xl font-semibold">Booking details</h3>
              </div>
              <button
                onClick={() => setActiveAppointment(null)}
                className="text-white/70 hover:text-white text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/50 uppercase">Barber</p>
                <p className="text-lg font-medium">
                  {activeAppointment.barberName}
                </p>
                <p className="text-white/60">
                  {activeAppointment.barberServices}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-white/50 uppercase mb-1">Date</p>
                  <p className="font-medium">
                    {formatDateDisplay(activeAppointment.data.appointment_date)}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-white/50 uppercase mb-1">Time</p>
                  <p className="font-medium">
                    {activeAppointment.data.slot_time}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div>
                  <p className="text-xs text-white/50 uppercase mb-1">
                    Customer
                  </p>
                  <p className="font-medium">
                    {activeAppointment.data.customer_name || '—'}
                  </p>
                  <p className="text-white/60">
                    {activeAppointment.data.customer_phone ||
                      'No phone on file'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase mb-1">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs">
                    {activeAppointment.data.status}
                  </span>
                </div>
                {activeAppointment.data.notes && (
                  <div>
                    <p className="text-xs text-white/50 uppercase mb-1">
                      Notes
                    </p>
                    <p className="text-white/70">
                      {activeAppointment.data.notes}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveAppointment(null)}
                className="w-full mt-4 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
