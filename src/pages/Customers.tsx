import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { supabase } from '../lib/supabase';

import type { Customer } from '../lib/types-global';

const dateFormatter = new Intl.DateTimeFormat('en-NZ', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

function formatTimeLabel(value?: string | null) {
  if (!value) return '--:--';
  return value.slice(0, 5);
}

export default function Customers(): JSX.Element {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(
            '*, barbers(name), users:users!appointments_user_id_fkey(name, phone_number, last_login_at)'
          )
          .order('appointment_date', { ascending: false })
          .order('start_time', { ascending: false });

        if (error) throw error;

        const grouped: Record<string, Customer> = {};

        data?.forEach((appt) => {
          const key = appt.user_id || appt.id;
          const user = appt.users;

          if (!grouped[key]) {
            grouped[key] = {
              id: key,
              name: user?.name || 'Unknown',
              phone: user?.phone_number,
              email: undefined,
              appointments: [],
            };
          }

          const customer = grouped[key];

          customer.appointments.push({
            date: appt.appointment_date,
            time: `${formatTimeLabel(appt.start_time)} - ${formatTimeLabel(
              appt.end_time
            )}`,
            barberName: appt.barbers?.name,
            status: appt.status,
            note: appt.note || undefined,
          });

          if (!customer.phone && user?.phone_number)
            customer.phone = user.phone_number;
          if (customer.name === 'Unknown' && user?.name)
            customer.name = user.name;
        });

        setCustomers(
          Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch (err) {
        console.error('Error loading customers:', err);
        setError(`Failed to load customer data from Supabase. ${String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Customers</h1>
          </div>
        </header>

        {loading && (
          <div className="text-white/70 text-center py-8">
            Loading customers…
          </div>
        )}
        {error && !loading && (
          <div className="text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
            {error}
          </div>
        )}
        {!loading && customers.length === 0 && (
          <div className="text-white/60 text-center py-12 border border-dashed border-white/20 rounded-2xl">
            No customers found.
          </div>
        )}

        <div className="grid gap-4">
          {customers.map((customer) => (
            <section
              key={customer.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{customer.name}</h2>
                  <p className="text-sm text-white/70">
                    {customer.phone || 'No phone on file'}
                  </p>
                  {customer.email && (
                    <p className="text-xs text-white/50">{customer.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {customer.appointments.map((appt, idx) => (
                  <div
                    key={`${customer.id}-${idx}`}
                    className="bg-black/30 border border-white/5 rounded-xl px-4 py-3 flex flex-col gap-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-white/90">{appt.time}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide ${
                          appt.status === 'booked'
                            ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-200 border border-rose-500/30'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">
                      {dateFormatter.format(new Date(appt.date))} ·{' '}
                      {appt.barberName || 'Any barber'}
                    </p>
                    {appt.note && (
                      <p className="text-xs text-white/60">Note: {appt.note}</p>
                    )}
                  </div>
                ))}
                {customer.appointments.length === 0 && (
                  <p className="text-sm text-white/50">
                    No appointments recorded yet.
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
