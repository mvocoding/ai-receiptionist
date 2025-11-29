import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import {
  supabase,
  type Barber as DBBarber,
  type BarberException as DBBarberException,
} from '../lib/supabase';

import type {
  Barber,
  BarberException,
  StoreSettings,
} from '../lib/types-global';

export default function Admin(): JSX.Element | null {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<StoreSettings>({
    bannerUrl:
      'https://images.unsplash.com/photo-1585191905284-8645af60f856?auto=format&fit=crop&q=80&w=800',
    introText: 'Welcome to Fade Station. Premium Barbershop Experience.',
    phoneNumber: '0483 804 500',
    address: '1 Fern Court,\nParafield Gardens, SA 5107',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM\nSat: 9:00 AM - 5:00 PM\nSun: Closed',
  });
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [exceptions, setExceptions] = useState<BarberException[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [showAddBarber, setShowAddBarber] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [newBarber, setNewBarber] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [exceptionForm, setExceptionForm] = useState({
    barberId: '',
    date: '',
    isDayOff: true,
    startTime: '',
    endTime: '',
  });
  const [savingException, setSavingException] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const userStr = localStorage.getItem('fs_user');
      if (!userStr) {
        setIsAuthenticated(false);
        (window as any).__navigate?.('/admin/signin') ??
          (window.location.pathname = '/admin/signin');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (!user || !user.email) {
          setIsAuthenticated(false);
          (window as any).__navigate?.('/admin/signin') ??
            (window.location.pathname = '/admin/signin');
          return;
        }
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error || !session) {
          localStorage.removeItem('fs_user');
          setIsAuthenticated(false);
          (window as any).__navigate?.('/admin/signin') ??
            (window.location.pathname = '/admin/signin');
          return;
        }

        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        (window as any).__navigate?.('/admin/signin') ??
          (window.location.pathname = '/admin/signin');
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated !== true) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: settingsData, error: settingsError } = await supabase
          .from('store_settings')
          .select('*')
          .limit(1)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('Error fetching settings:', settingsError);
        } else if (settingsData) {
          setSettingsId(settingsData.id);
          setSettings({
            bannerUrl: settingsData.banner_url || '',
            introText: settingsData.intro_text || '',
            phoneNumber: settingsData.phone_number || '',
            address: settingsData.address || '',
            hours: settingsData.hours || '',
          });
        }

        // Fetch barbers
        const { data: barbersData, error: barbersError } = await supabase
          .from('barbers')
          .select('*')
          .order('created_at', { ascending: true });

        if (barbersError) {
          console.error('Error fetching barbers:', barbersError);
        } else if (barbersData) {
          setBarbers(
            barbersData.map((b: DBBarber) => ({
              id: b.id,
              name: b.name,
              status: b.status as 'active' | 'inactive',
              description: b.description || '',
              createdAt: b.created_at || undefined,
            }))
          );
        }

        const { data: exceptionsData, error: exceptionsError } = await supabase
          .from('barber_exceptions')
          .select('*')
          .order('date', { ascending: true });

        if (exceptionsError) {
          console.error('Error fetching barber exceptions:', exceptionsError);
        } else if (exceptionsData) {
          setExceptions(
            (exceptionsData as DBBarberException[]).map((ex) => ({
              id: ex.id,
              barberId: ex.barber_id,
              date: ex.date,
              isDayOff: ex.is_day_off,
              startTime: ex.start_time || '',
              endTime: ex.end_time || '',
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (isAuthenticated === false || isAuthenticated === null) {
    return null;
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setUploadingBanner(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('store-assets').getPublicUrl(filePath);

      setSettings((prev) => ({
        ...prev,
        bannerUrl: publicUrl,
      }));
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner image. Please try again.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarber.name.trim()) {
      alert('Please enter a barber name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('barbers')
        .insert({
          name: newBarber.name.trim(),
          description: newBarber.description.trim() || null,
          status: newBarber.status,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setBarbers((prev) => [
          ...prev,
          {
            id: data.id,
            name: data.name,
            status: data.status as 'active' | 'inactive',
            description: data.description || '',
            createdAt: data.created_at || undefined,
          },
        ]);
        setNewBarber({
          name: '',
          description: '',
          status: 'active',
        });
        setShowAddBarber(false);
        alert('Barber added successfully!');
      }
    } catch (error) {
      console.error('Error adding barber:', error);
      alert('Failed to add barber. Please try again.');
    }
  };

  const handleEditBarber = (barber: Barber) => {
    setEditingBarber(barber);
    setShowAddBarber(true);
    setNewBarber({
      name: barber.name,
      description: barber.description || '',
      status: barber.status,
    });
  };

  const handleUpdateBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBarber) return;
    if (!newBarber.name.trim()) {
      alert('Please enter a barber name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('barbers')
        .update({
          name: newBarber.name.trim(),
          description: newBarber.description.trim() || null,
          status: newBarber.status,
        })
        .eq('id', editingBarber.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setBarbers((prev) =>
          prev.map((b) =>
            b.id === editingBarber.id
              ? {
                  ...b,
                  name: data.name,
                  status: data.status as 'active' | 'inactive',
                  description: data.description || '',
                }
              : b
          )
        );
        setEditingBarber(null);
        setShowAddBarber(false);
        setNewBarber({
          name: '',
          description: '',
          status: 'active',
        });
        alert('Barber updated successfully!');
      }
    } catch (error) {
      console.error('Error updating barber:', error);
      alert('Failed to update barber. Please try again.');
    }
  };

  const deleteBarber = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this barber?')) return;

    try {
      const { error } = await supabase.from('barbers').delete().eq('id', id);

      if (error) throw error;

      setBarbers(barbers.filter((b) => b.id !== id));
      alert('Barber deleted successfully!');
    } catch (error) {
      console.error('Error deleting barber:', error);
      alert('Failed to delete barber. Please try again.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updateData = {
        banner_url: settings.bannerUrl,
        intro_text: settings.introText,
        phone_number: settings.phoneNumber,
        address: settings.address,
        hours: settings.hours,
      };

      if (settingsId) {
        const { error } = await supabase
          .from('store_settings')
          .update(updateData)
          .eq('id', settingsId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('store_settings')
          .insert(updateData)
          .select()
          .single();

        if (error) throw error;
        if (data) setSettingsId(data.id);
      }

      alert('Store settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleSaveException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionForm.barberId || !exceptionForm.date) {
      alert('Select a barber and date for the exception');
      return;
    }
    if (
      !exceptionForm.isDayOff &&
      (!exceptionForm.startTime.trim() || !exceptionForm.endTime.trim())
    ) {
      alert('Specify start and end times or mark as a full day off');
      return;
    }

    setSavingException(true);
    try {
      const payload = {
        barber_id: exceptionForm.barberId,
        date: exceptionForm.date,
        is_day_off: exceptionForm.isDayOff,
        start_time: exceptionForm.isDayOff ? null : exceptionForm.startTime,
        end_time: exceptionForm.isDayOff ? null : exceptionForm.endTime,
      };

      const { data, error } = await supabase
        .from('barber_exceptions')
        .insert(payload)
        .select()
        .single<DBBarberException>();

      if (error) throw error;

      if (data) {
        setExceptions((prev) =>
          [
            ...prev,
            {
              id: data.id,
              barberId: data.barber_id,
              date: data.date,
              isDayOff: data.is_day_off,
              startTime: data.start_time || '',
              endTime: data.end_time || '',
            },
          ].sort((a, b) => a.date.localeCompare(b.date))
        );
        setExceptionForm({
          barberId: '',
          date: '',
          isDayOff: true,
          startTime: '',
          endTime: '',
        });
      }
    } catch (error) {
      console.error('Error saving exception:', error);
      alert('Failed to save exception. Please try again.');
    } finally {
      setSavingException(false);
    }
  };

  const handleDeleteException = async (id: string) => {
    if (!window.confirm('Delete this exception?')) return;

    try {
      const { error } = await supabase
        .from('barber_exceptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setExceptions((prev) => prev.filter((ex) => ex.id !== id));
    } catch (error) {
      console.error('Error deleting exception:', error);
      alert('Failed to delete exception. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Store Settings</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Store Banner Image
              </label>
              <div className="mb-4">
                <img
                  src={settings.bannerUrl}
                  alt="Store Banner"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-500/90 file:text-white file:cursor-pointer"
              />
              {uploadingBanner && (
                <p className="text-xs text-sky-400 mt-2">Uploading...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Store Introduction
              </label>
              <textarea
                value={settings.introText}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    introText: e.target.value,
                  }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                rows={3}
                placeholder="Enter your store introduction..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Phone Number
              </label>
              <textarea
                value={settings.phoneNumber}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                rows={1}
                placeholder="0483 804 500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                rows={2}
                placeholder="1 Fern Court,
Parafield Gardens, SA 5107"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Hours
              </label>
              <textarea
                value={settings.hours}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, hours: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                rows={3}
                placeholder="Mon-Fri: 9:00 AM - 6:00 PM
Sat: 9:00 AM - 5:00 PM
Sun: Closed"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Barbers</h2>
            <button
              onClick={() => {
                setShowAddBarber(!showAddBarber);
                setEditingBarber(null);
                setNewBarber({
                  name: '',
                  description: '',
                  status: 'active',
                });
              }}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 transition font-medium text-sm"
            >
              + Add Barber
            </button>
          </div>

          {(showAddBarber || editingBarber) && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {editingBarber ? 'Edit Barber' : 'Add New Barber'}
              </h3>
              <form
                onSubmit={editingBarber ? handleUpdateBarber : handleAddBarber}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newBarber.name}
                    onChange={(e) =>
                      setNewBarber({ ...newBarber, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    placeholder="Barber name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newBarber.description}
                    onChange={(e) =>
                      setNewBarber({
                        ...newBarber,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                    placeholder="Services, styles, or any notes about this barber"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Status
                  </label>
                  <select
                    value={newBarber.status}
                    onChange={(e) =>
                      setNewBarber({
                        ...newBarber,
                        status: e.target.value as 'active' | 'inactive',
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition font-medium"
                  >
                    {editingBarber ? 'Update Barber' : 'Add Barber'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddBarber(false);
                      setEditingBarber(null);
                      setNewBarber({
                        name: '',
                        description: '',
                        status: 'active',
                      });
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{barber.name}</h3>
                    <p className="text-sm text-white/70 mt-1">
                      {barber.description || 'No description provided.'}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      barber.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                    }`}
                  >
                    {barber.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditBarber(barber)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:bg-sky-500/30 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBarber(barber.id)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Barber Exceptions - mark days off
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <form
              onSubmit={handleSaveException}
              className="grid gap-4 md:grid-cols-2"
            >
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Barber
                </label>
                <select
                  value={exceptionForm.barberId}
                  onChange={(e) =>
                    setExceptionForm((prev) => ({
                      ...prev,
                      barberId: e.target.value,
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                >
                  <option value="">Select barber...</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={exceptionForm.date}
                  onChange={(e) =>
                    setExceptionForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Exception Type
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="full-day-off"
                    type="checkbox"
                    checked={exceptionForm.isDayOff}
                    onChange={(e) =>
                      setExceptionForm((prev) => ({
                        ...prev,
                        isDayOff: e.target.checked,
                        startTime: '',
                        endTime: '',
                      }))
                    }
                    className="w-4 h-4 rounded border-white/30 bg-white/5 checked:bg-sky-500 cursor-pointer"
                  />
                  <label
                    htmlFor="full-day-off"
                    className="text-sm text-white/80"
                  >
                    Mark entire day as off
                  </label>
                </div>
              </div>

              {!exceptionForm.isDayOff && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={exceptionForm.startTime}
                      onChange={(e) =>
                        setExceptionForm((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={exceptionForm.endTime}
                      onChange={(e) =>
                        setExceptionForm((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingException}
                  className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingException ? 'Saving...' : 'Add Exception'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 space-y-3">
            {exceptions.map((ex) => {
              const barberName =
                barbers.find((b) => b.id === ex.barberId)?.name ||
                'Unknown barber';
              const formattedDate = new Date(
                ex.date + 'T00:00:00'
              ).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              return (
                <div
                  key={ex.id}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      {barberName}
                    </p>
                    <p className="text-xs text-white/60">{formattedDate}</p>
                    <p className="text-xs text-white/70 mt-1">
                      {ex.isDayOff
                        ? 'Full day off'
                        : `Custom hours ${ex.startTime} – ${ex.endTime}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteException(ex.id)}
                    className="text-xs text-rose-300 hover:text-rose-200 border border-rose-500/40 px-3 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
