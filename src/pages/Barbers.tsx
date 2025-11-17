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
