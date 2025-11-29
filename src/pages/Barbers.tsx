import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import {
  supabase,
  type Barber as DBBarber,
  type BarberException as DBBarberException,
} from '../lib/supabase';

import type {
  BarberView,
  AppointmentView,
  ExceptionMap,
} from '../lib/types-global';

import {
  formatDate,
  formatPretty,
  cutTime,
  makeSlotList,
  buildAllowedSet,
} from '../lib/utils';

const slotConfig = { open: '09:00', close: '18:00', step: 30 };

export default function Barbers(): JSX.Element {
  const [day, setDay] = useState(() => new Date());
  const [barberList, setBarberList] = useState<BarberView[]>([]);
  const [busyBarber, setBusyBarber] = useState(true);
  const [slotBusy, setSlotBusy] = useState(false);
  const [slotByBarber, setSlotByBarber] = useState<
    Record<string, AppointmentView[]>
  >({});
  const [excByBarber, setExcByBarber] = useState<ExceptionMap>({});
  const [modalInfo, setModalInfo] = useState<AppointmentView | null>(null);
  const [errText, setErrText] = useState<string | null>(null);

  const dayText = useMemo(() => formatDate(day), [day]);
  const slotList = useMemo(
    () => makeSlotList(slotConfig.open, slotConfig.close, slotConfig.step),
    []
  );

  useEffect(() => {
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

    void loadBarber();
  }, []);

  useEffect(() => {
    async function loadSlots() {
      setSlotBusy(true);
      setErrText(null);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*, users(name, phone_number)')
          .eq('appointment_date', dayText)
          .not('status', 'eq', 'cancelled');
        if (error) throw error;

        const bucket: Record<string, AppointmentView[]> = {};
        (data as AppointmentView[] | null)?.forEach((item) => {
          if (!bucket[item.barber_id]) bucket[item.barber_id] = [];
          bucket[item.barber_id].push(item);
        });
        setSlotByBarber(bucket);
      } catch (err) {
        console.error('load appointments fail', err);
        setSlotByBarber({});
        setErrText('Unable to load appointments for this day.');
      } finally {
        setSlotBusy(false);
      }
    }

    async function loadException() {
      try {
        const { data, error } = await supabase
          .from('barber_exceptions')
          .select('*')
          .eq('date', dayText);
        if (error) throw error;
        const obj: ExceptionMap = {};
        (data as DBBarberException[] | null)?.forEach((item) => {
          obj[item.barber_id] = {
            isDayOff: item.is_day_off,
            start: cutTime(item.start_time),
            end: cutTime(item.end_time),
          };
        });
        setExcByBarber(obj);
      } catch (err) {
        console.error('load exceptions fail', err);
        setExcByBarber({});
      }
    }

    void loadSlots();
    void loadException();
  }, [dayText]);

  function moveDay(delta: number) {
    setDay((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Barbers Availability</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveDay(-1)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
            >
              Prev
            </button>
            <input
              type="date"
              value={dayText}
              onChange={(e) => setDay(new Date(e.target.value + 'T00:00:00'))}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
            <button
              onClick={() => moveDay(1)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
            >
              Next
            </button>
          </div>
        </div>

        {errText && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-sm text-rose-200">
            {errText}
          </div>
        )}

        {busyBarber ? (
          <p className="text-white/60 mt-4">Loading barbers…</p>
        ) : barberList.length === 0 ? (
          <p className="text-white/60 mt-4">No barbers configured.</p>
        ) : (
          <div className="space-y-4">
            {barberList.map((barber) => {
              const apptList = slotByBarber[barber.id] || [];
              const apptBySlot = new Map(
                apptList.map((item) => [cutTime(item.start_time), item])
              );
              const excInfo = excByBarber[barber.id];
              const allowSet = buildAllowedSet(excInfo, slotList);

              return (
                <section
                  key={barber.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/60">
                        {barber.status === 'active' ? 'Active' : 'Inactive'}{' '}
                        barber
                      </p>
                      <h2 className="text-xl font-semibold">{barber.name}</h2>
                      {excInfo && (
                        <p className="text-xs mt-1 text-amber-200">
                          {excInfo.isDayOff
                            ? 'Marked as day off'
                            : `Custom hours ${excInfo.start ?? '--:--'} – ${
                                excInfo.end ?? '--:--'
                              }`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slotList.map((slot) => {
                      const appt = apptBySlot.get(slot);
                      const allowed = allowSet.has(slot);
                      const disabled = barber.status !== 'active' || !allowed;
                      return (
                        <button
                          key={slot}
                          onClick={() => appt && setModalInfo(appt)}
                          disabled={disabled && !appt}
                          className={`px-3 py-2 rounded-xl text-xs border ${
                            appt
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-200 hover:bg-rose-500/30'
                              : disabled
                              ? 'bg-white/5 border-white/10 text-white/30 opacity-50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {slotBusy && (
                    <p className="text-xs text-white/40">Refreshing slots…</p>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {modalInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60 uppercase">Appointment</p>
                <h3 className="text-2xl font-semibold">Booking details</h3>
              </div>
              <button
                onClick={() => setModalInfo(null)}
                className="text-white/70 hover:text-white text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/50 text-xs mb-1">Date</p>
                <p className="font-medium">
                  {formatPretty(modalInfo.appointment_date)}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/50 text-xs mb-1">Time</p>
                <p className="font-medium">
                  {cutTime(modalInfo.start_time)} –{' '}
                  {cutTime(modalInfo.end_time)}
                </p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-sm">
              <p className="text-white/50 text-xs">Customer</p>
              <p className="font-medium">{modalInfo.users?.name || '-'}</p>
              <p className="text-white/60">
                {modalInfo.users?.phone_number || 'No phone'}
              </p>
              {modalInfo.note && (
                <p className="text-white/70">{modalInfo.note}</p>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm">
              <p className="text-white/50 text-xs mb-1">Status</p>
              <span className="inline-flex px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs">
                {modalInfo.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
