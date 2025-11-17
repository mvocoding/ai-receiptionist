import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';

const barbersStatic = [
  { id: 'ace', name: 'Ace', services: 'Fades · Beard · Kids' },
  { id: 'jay', name: 'Jay', services: 'Tapers · Line-ups' },
  { id: 'mia', name: 'Mia', services: 'Skin Fades · Scissor' },
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
  const [barber, setBarber] = useState<string>('all');
  const [bookedByDate, setBookedByDate] = useState<
    Record<string, Record<string, string[]>>
  >({});
  const [selectedSlots, setSelectedSlots] = useState<
    Record<string, Set<string>>
  >({}); // ui-only selections

  const state = useMemo(
    () => ({ open: '09:00', close: '18:00', stepMin: 30 }),
    []
  );

  // seed demo bookings on mount
  useEffect(() => {
    const today = fmtDate(new Date());
    const tomorrow = fmtDate(new Date(Date.now() + 86400000));
    setBookedByDate({
      [today]: {
        ace: ['09:00', '10:00', '14:30'],
        jay: ['11:30', '15:00'],
        mia: ['09:30', '13:00', '16:00'],
      },
      [tomorrow]: {
        ace: ['12:00', '12:30', '13:00'],
        jay: ['09:00', '09:30', '10:00', '10:30'],
        mia: [],
      },
    });
  }, []);

  const dateStr = fmtDate(date);
  const allSlots = useMemo(
    () => generateSlots(state.open, state.close, state.stepMin),
    [state]
  );

  function getAvailableSlotsFor(barberId: string) {
    const booked =
      (bookedByDate[dateStr] && bookedByDate[dateStr][barberId]) || [];
    const set = new Set(booked);
    return allSlots.filter((s) => !set.has(s));
  }

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

  const barberIds =
    barber === 'all' ? barbersStatic.map((b) => b.id) : [barber];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* unified nav */}
      <NavBar />

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* header */}
        <header className="sticky top-0 z-40">
          <div className="backdrop-blur-md bg-white/5 border border-ios-border rounded-2xl shadow-glow">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <a
                  href="/landing"
                  className="flex items-center gap-3 hover:opacity-80 transition"
                >
                  <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                    <span className="text-xs font-semibold">FS</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold tracking-tight">
                      Barbers
                    </h1>
                    <p className="text-xs text-ios-textMuted">
                      Availability · 30-min slots
                    </p>
                  </div>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/landing"
                  className="px-3 py-1.5 rounded-xl text-xs text-ios-textMuted hover:text-white transition"
                >
                  Home
                </a>
                <a
                  href="/index.html"
                  className="px-3 py-1.5 rounded-xl text-xs text-ios-textMuted hover:text-white transition"
                >
                  Recordings
                </a>
                <a
                  href="/communications.html"
                  className="px-3 py-1.5 rounded-xl text-xs text-ios-textMuted hover:text-white transition"
                >
                  Messages
                </a>
                <a
                  href="/training.html"
                  className="px-3 py-1.5 rounded-xl text-xs text-ios-textMuted hover:text-white transition"
                >
                  Training
                </a>
                <a
                  href="/flow.html"
                  className="px-3 py-1.5 rounded-xl text-xs text-ios-textMuted hover:text-white transition"
                >
                  Flow
                </a>
                <a
                  href="/demo.html"
                  className="px-3 py-1.5 rounded-xl text-xs bg-sky-500/90 hover:bg-sky-500 transition shadow"
                >
                  Demo
                </a>
              </div>
            </div>

            <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="relative">
                <input
                  id="dateInput"
                  type="date"
                  value={dateStr}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full bg-white/5 border border-ios-border rounded-xl px-3 py-2.5 text-sm placeholder:text-ios-textMuted focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <div className="inline-flex bg-white/5 border border-ios-border rounded-xl p-1">
                  <button
                    onClick={() => {
                      setBarber('all');
                    }}
                    data-barber="all"
                    className={`barber-tab px-3 py-1.5 text-xs rounded-lg ${
                      barber === 'all' ? 'bg-white/10' : ''
                    }`}
                  >
                    All
                  </button>
                  {barbersStatic.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBarber(b.id)}
                      data-barber={b.id}
                      className={`barber-tab px-3 py-1.5 text-xs rounded-lg ${
                        barber === b.id ? 'bg-white/10' : ''
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
                <div className="ml-auto">
                  <button
                    onClick={handlePrevDay}
                    className="px-3 py-1.5 text-xs rounded-xl bg-white/10 border border-ios-border"
                  >
                    Prev
                  </button>
                  <button
                    onClick={handleNextDay}
                    className="px-3 py-1.5 text-xs rounded-xl bg-white/10 border border-ios-border"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-4 space-y-4" id="gridRoot">
          {barberIds.length === 0 && (
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

          {barberIds.map((barberId) => {
            const b = barbersStatic.find((x) => x.id === barberId);
            if (!b) return null;
            const slots = getAvailableSlotsFor(barberId);
            const selected = selectedSlots[barberId] || new Set<string>();
            return (
              <section
                key={barberId}
                className="bg-gradient-to-b from-[#111111] to-[#0d0d0d] border border-ios-border rounded-2xl shadow-glow overflow-hidden"
              >
                <div className="p-4 flex items-start gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <span className="avatar text-sm font-semibold">
                      {b.name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm barber-name">
                          {b.name}
                        </h3>
                        <p className="text-xs text-ios-textMuted">
                          Available slots ·{' '}
                          <span className="slot-count">{slots.length}</span>
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-[10px]">
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/80 service">
                          {b.services}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {slots.length === 0 ? (
                        <div className="text-xs text-ios-textMuted">
                          No slots today
                        </div>
                      ) : (
                        slots.map((s) => {
                          const isSelected = selected.has(s);
                          return (
                            <button
                              key={s}
                              onClick={() => toggleSelect(barberId, s)}
                              className={
                                'slot-btn px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs transition ' +
                                (isSelected
                                  ? 'bg-emerald-500/20 border-emerald-400/30'
                                  : '')
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

        <footer className="py-8 text-center text-xs text-ios-textMuted">
          Fade Station · Barbers & Availability
        </footer>
      </div>
    </div>
  );
}
