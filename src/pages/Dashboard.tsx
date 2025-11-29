import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { supabase } from '../lib/supabase';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const menulist = [
  {
    name: 'Admin Panel',
    path: '/admin',
    description: 'Manage store settings and barbers',
  },
  {
    name: 'Communications',
    path: '/communications',
    description: 'View calls, SMS, and recordings',
  },
  {
    name: 'Customers',
    path: '/customers',
    description: 'View customer list and history',
  },
  {
    name: 'AI Knowledge',
    path: '/ai-knowledge',
    description: 'Design call and SMS conversation flows',
  },
  {
    name: 'Barbers',
    path: '/barbers',
    description: 'View barber schedules and availability',
  },
  {
    name: 'Book Appointment',
    path: '/book',
    description: 'Public booking page',
  },
];

export default function Dashboard(): JSX.Element {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalBarbers: 0,
    totalCommunications: 0,
    loading: true,
  });
  const [appointmentsByDate, setAppointmentsByDate] = useState<
    { date: string; count: number }[]
  >([]);
  const [todayAppointmentsByHour, setTodayAppointmentsByHour] = useState<
    { hour: string; count: number }[]
  >([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        const { data: appointments } = await supabase
          .from('appointments')
          .select('appointment_date, status, start_time')
          .not('status', 'eq', 'cancelled')
          .order('appointment_date', { ascending: false });

        const { data: todayAppointments } = await supabase
          .from('appointments')
          .select('id, start_time')
          .eq('appointment_date', today)
          .not('status', 'eq', 'cancelled');

        const { data: barbers } = await supabase.from('barbers').select('id');

        const { data: communications } = await supabase
          .from('communications')
          .select('id');

        const last7Days: { date: string; count: number }[] = [];
        const todayDate = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(todayDate);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const count =
            appointments?.filter((apt) => apt.appointment_date === dateStr)
              .length || 0;
          last7Days.push({
            date: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            count,
          });
        }

        const businessHours = Array.from({ length: 10 }, (_, i) => {
          const hourIndex = i + 9; // 9 AM to 6 PM
          const hour = hourIndex.toString().padStart(2, '0') + ':00';
          return { hour, count: 0 };
        });

        todayAppointments?.forEach((apt) => {
          if (apt.start_time) {
            const hour = apt.start_time.substring(0, 5);
            const hourIndex = parseInt(hour.split(':')[0]);
            if (hourIndex >= 9 && hourIndex <= 18) {
              const idx = hourIndex - 9;
              if (idx >= 0 && idx < businessHours.length) {
                businessHours[idx].count++;
              }
            }
          }
        });

        setAppointmentsByDate(last7Days);
        setTodayAppointmentsByHour(businessHours);

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

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        </div>

        {stats.loading ? (
          <div className="text-center py-12 text-white/60">
            Loading statistics...
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white/90">
                    Total Appointments
                  </h3>
                  <span className="text-2xl font-bold text-sky-400">
                    {stats.totalAppointments}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={appointmentsByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis
                      dataKey="date"
                      stroke="#ffffff60"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#ffffff60" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-white/50 mt-2 text-center">
                  Last 7 days
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white/90">
                    Today's Appointments
                  </h3>
                  <span className="text-2xl font-bold text-emerald-400">
                    {stats.todayAppointments}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={todayAppointmentsByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis
                      dataKey="hour"
                      stroke="#ffffff60"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#ffffff60" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-white/50 mt-2 text-center">
                  By hour
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menulist.map((menu) => (
                <button
                  key={menu.name}
                  onClick={() => (window as any).gotopage(menu.path)}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-lg font-semibold">{menu.name}</h3>
                  </div>
                  <p className="text-sm text-white/60">{menu.description}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
