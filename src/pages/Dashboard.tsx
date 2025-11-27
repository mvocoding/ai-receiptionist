import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { supabase } from '../lib/supabase';

export default function Dashboard(): JSX.Element {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalBarbers: 0,
    totalCommunications: 0,
    loading: true,
  });

  useEffect(() => {
    document.title = 'Dashboard · Fade Station';
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute(
      'content',
      'Fade Station Dashboard · Overview and Statistics'
    );
    if (!document.querySelector('meta[name="description"]'))
      document.head.appendChild(meta);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('appointment_date, status')
          .not('status', 'eq', 'cancelled');

        const { data: todayAppointments, error: todayError } = await supabase
          .from('appointments')
          .select('id')
          .eq('appointment_date', today)
          .not('status', 'eq', 'cancelled');

        const { data: barbers, error: barbersError } = await supabase
          .from('barbers')
          .select('id');

        const { data: communications, error: commError } = await supabase
          .from('communications')
          .select('id');

        setStats({
          totalAppointments: appointments?.length || 0,
          todayAppointments: todayAppointments?.length || 0,
          totalBarbers: barbers?.length || 0,
          totalCommunications: communications?.length || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  function nav(to: string) {
    const fn = (window as any).__navigate;
    if (fn) fn(to);
    else window.location.pathname = to;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-white/60">
            Overview of your barbershop operations
          </p>
        </div>

        {stats.loading ? (
          <div className="text-center py-12 text-white/60">
            Loading statistics...
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white/70">
                    Total Appointments
                  </h3>
                </div>
                <p className="text-3xl font-bold">{stats.totalAppointments}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white/70">
                    Today's Appointments
                  </h3>
                </div>
                <p className="text-3xl font-bold">{stats.todayAppointments}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white/70">Barbers</h3>
                </div>
                <p className="text-3xl font-bold">{stats.totalBarbers}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white/70">
                    Communications
                  </h3>
                </div>
                <p className="text-3xl font-bold">
                  {stats.totalCommunications}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => nav('/admin')}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold">Admin Panel</h3>
                </div>
                <p className="text-sm text-white/60">
                  Manage store settings and barbers
                </p>
              </button>

              <button
                onClick={() => nav('/communications')}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold">Communications</h3>
                </div>
                <p className="text-sm text-white/60">
                  View calls, SMS, and recordings
                </p>
              </button>

              <button
                onClick={() => nav('/customers')}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold">Customers</h3>
                </div>
                <p className="text-sm text-white/60">
                  View customer list and history
                </p>
              </button>

              <button
                onClick={() => nav('/flow')}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold">Flow Builder</h3>
                </div>
                <p className="text-sm text-white/60">
                  Design call and SMS conversation flows
                </p>
              </button>

              <button
                onClick={() => nav('/barbers')}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold">Barbers</h3>
                </div>
                <p className="text-sm text-white/60">
                  View barber schedules and availability
                </p>
              </button>

              <button
                onClick={() => nav('/book')}
                className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold">Book Appointment</h3>
                </div>
                <p className="text-sm text-white/60">Public booking page</p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
