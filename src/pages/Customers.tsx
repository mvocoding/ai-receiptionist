import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import { supabase, type Appointment as DBAppointment } from '../lib/supabase';

import { Customer } from '../lib/types-global';

const dateFormatter = new Intl.DateTimeFormat('en-NZ', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

function formatDateTime(dateStr: string, timeStr: string) {
  return `${dateFormatter.format(new Date(dateStr))} · ${timeStr}`;
}

export default function Customers(): JSX.Element {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Fade Station · Customers';
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*, barbers(name)')
          .order('appointment_date', { ascending: false })
          .order('slot_time', { ascending: false });

        if (appointmentsError) throw appointmentsError;

        const grouped: Record<string, Customer> = {};
        (
          data as (DBAppointment & { barbers?: { name?: string } })[] | null
        )?.forEach((appt) => {
          const key = appt.customer_phone || appt.customer_name || appt.id;
          if (!grouped[key]) {
            grouped[key] = {
              id: key,
              name: appt.customer_name || 'Unknown',
              phone: appt.customer_phone || undefined,
              appointments: [],
            };
          }

          grouped[key].appointments.push({
            date: appt.appointment_date,
            time: appt.slot_time,
            barberName: appt.barbers?.name || undefined,
            status: appt.status,
          });

          if (!grouped[key].lastAppointment) {
            grouped[key].lastAppointment = formatDateTime(
              appt.appointment_date,
              appt.slot_time
            );
          }
        });

        setCustomers(Object.values(grouped));
      } catch (err) {
        console.error('Error loading customers:', err);
        setError('Failed to load customer data from Supabase.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const term = search.trim().toLowerCase();
    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term)
      );
    });
  }, [customers, search]);

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
        {!loading && filtered.length === 0 && (
          <div className="text-white/60 text-center py-12 border border-dashed border-white/20 rounded-2xl">
            No customers found.
          </div>
        )}

        <div className="grid gap-4">
          {filtered.map((customer) => (
            <section
              key={customer.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{customer.name}</h2>
                  <p className="text-sm text-white/60">
                    {customer.phone || 'No phone'}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
