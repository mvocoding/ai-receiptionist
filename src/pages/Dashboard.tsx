import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import {
  supabase,
  type StoreSettings as DBStoreSettings,
  type Barber as DBBarber,
} from '../lib/supabase';

type Barber = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  phone?: string;
  price: number;
  workingDays: string[];
};

type StoreSettings = {
  bannerUrl: string;
  introText: string;
  phoneNumber: string;
  address: string;
  hours: string;
};

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function Dashboard(): JSX.Element {
  const [settings, setSettings] = useState<StoreSettings>({
    bannerUrl:
      'https://images.unsplash.com/photo-1585191905284-8645af60f856?auto=format&fit=crop&q=80&w=800',
    introText: 'Welcome to Fade Station. Premium Barbershop Experience.',
    phoneNumber: '+64 1 234 56789',
    address: '123 Barbershop Avenue\nAuckland, NZ 1010',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM\nSat: 9:00 AM - 5:00 PM\nSun: Closed',
  });

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Dashboard · Fade Station';
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute(
      'content',
      'Fade Station Dashboard · Manage your barbershop'
    );
    if (!document.querySelector('meta[name="description"]'))
      document.head.appendChild(meta);
  }, []);

  useEffect(() => {
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
          .order('created_at', { ascending: false });

        if (barbersError) {
          console.error('Error fetching barbers:', barbersError);
        } else if (barbersData) {
          setBarbers(
            barbersData.map((b: DBBarber) => ({
              id: b.id,
              name: b.name,
              specialty: b.specialty,
              image: b.image,
              phone: b.phone || '',
              price: Number(b.price),
              workingDays: b.working_days || [],
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
  }, []);

  const [showAddBarber, setShowAddBarber] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [newBarber, setNewBarber] = useState({
    name: '',
    specialty: '',
    price: '',
    phone: '',
    workingDays: [] as string[],
    avatarFile: null as File | null,
    avatarPreview: '',
    uploadingAvatar: false,
  });
  const [uploadingBanner, setUploadingBanner] = useState(false);

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

  const toggleWorkingDay = (day: string) => {
    setNewBarber((prev) => {
      const days = prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: days };
    });
  };

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newBarber.name.trim() ||
      !newBarber.specialty.trim() ||
      !newBarber.price.trim() ||
      newBarber.workingDays.length === 0
    ) {
      alert('Please fill in all fields and select at least one working day');
      return;
    }

    try {
      let imageUrl =
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200';

      if (newBarber.avatarFile) {
        setNewBarber((prev) => ({ ...prev, uploadingAvatar: true }));
        const ext = newBarber.avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `barbers/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('store-assets')
          .upload(fileName, newBarber.avatarFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('store-assets').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('barbers')
        .insert({
          name: newBarber.name,
          specialty: newBarber.specialty,
          image: imageUrl,
          phone: newBarber.phone.trim() || null,
          price: Number(newBarber.price),
          working_days: newBarber.workingDays,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setBarbers([
          {
            id: data.id,
            name: data.name,
            specialty: data.specialty,
            image: data.image,
            phone: data.phone || '',
            price: Number(data.price),
            workingDays: data.working_days || [],
          },
          ...barbers,
        ]);
        setNewBarber({
          name: '',
          specialty: '',
          price: '',
          phone: '',
          workingDays: [],
          avatarFile: null,
          avatarPreview: '',
          uploadingAvatar: false,
        });
        setShowAddBarber(false);
        alert('Barber added successfully!');
      }
    } catch (error) {
      console.error('Error adding barber:', error);
      alert('Failed to add barber. Please try again.');
    } finally {
      setNewBarber((prev) => ({ ...prev, uploadingAvatar: false, avatarFile: null }));
    }
  };

  const handleEditBarber = (barber: Barber) => {
    setEditingBarber(barber);
    setNewBarber({
      name: barber.name,
      specialty: barber.specialty,
      price: String(barber.price),
      phone: barber.phone || '',
      workingDays: barber.workingDays,
      avatarFile: null,
      avatarPreview: barber.image,
      uploadingAvatar: false,
    });
  };

  const handleUpdateBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBarber) return;
    if (
      !newBarber.name.trim() ||
      !newBarber.specialty.trim() ||
      !newBarber.price.trim() ||
      newBarber.workingDays.length === 0
    ) {
      alert('Please fill in all fields and select at least one working day');
      return;
    }

    try {
      let imageUrl = editingBarber.image;

      if (newBarber.avatarFile) {
        setNewBarber((prev) => ({ ...prev, uploadingAvatar: true }));
        const ext = newBarber.avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `barbers/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('store-assets')
          .upload(fileName, newBarber.avatarFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('store-assets').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('barbers')
        .update({
          name: newBarber.name,
          specialty: newBarber.specialty,
          image: imageUrl,
          phone: newBarber.phone.trim() || null,
          price: Number(newBarber.price),
          working_days: newBarber.workingDays,
        })
        .eq('id', editingBarber.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setBarbers(
          barbers.map((b) =>
            b.id === editingBarber.id
              ? {
                  ...b,
                  name: data.name,
                  specialty: data.specialty,
                  image: data.image,
                  phone: data.phone || '',
                  price: Number(data.price),
                  workingDays: data.working_days || [],
                }
              : b
          )
        );
        setEditingBarber(null);
        setNewBarber({
          name: '',
          specialty: '',
          price: '',
          phone: '',
          workingDays: [],
          avatarFile: null,
          avatarPreview: '',
          uploadingAvatar: false,
        });
        alert('Barber updated successfully!');
      }
    } catch (error) {
      console.error('Error updating barber:', error);
      alert('Failed to update barber. Please try again.');
    } finally {
      setNewBarber((prev) => ({ ...prev, uploadingAvatar: false, avatarFile: null }));
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
              <p className="text-xs text-ios-textMuted mt-2">
                Recommended size: 1200x400px
              </p>
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
                placeholder="+64 1 234 56789"
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
                placeholder="123 Barbershop Avenue
Auckland, NZ 1010"
              />
            </div>

            {/* Hours */}
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
                        specialty: '',
                        price: '',
                        phone: '',
                        workingDays: [],
                        avatarFile: null,
                        avatarPreview: '',
                        uploadingAvatar: false,
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
                  <div className="flex flex-col gap-3">
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Avatar
                    </label>
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          newBarber.avatarPreview ||
                          editingBarber?.image ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
                        }
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-white/5"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewBarber((prev) => ({
                            ...prev,
                            avatarFile: file,
                            avatarPreview: file ? URL.createObjectURL(file) : '',
                          }));
                        }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-500/90 file:text-white file:cursor-pointer"
                      />
                    </div>
                    {newBarber.uploadingAvatar && (
                      <p className="text-xs text-sky-400">Uploading image...</p>
                    )}
                  </div>

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
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newBarber.phone}
                        onChange={(e) =>
                          setNewBarber({ ...newBarber, phone: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        placeholder="+64 21 123 4567"
                      />
                    </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={newBarber.specialty}
                    onChange={(e) =>
                      setNewBarber({ ...newBarber, specialty: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    placeholder="e.g. Fades · Beard · Kids"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={newBarber.price}
                    onChange={(e) =>
                      setNewBarber({ ...newBarber, price: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    placeholder="45"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
                    Working Days
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newBarber.workingDays.includes(day)}
                          onChange={() => toggleWorkingDay(day)}
                          className="w-4 h-4 rounded border-white/30 bg-white/5 checked:bg-sky-500 cursor-pointer"
                        />
                        <span className="text-sm text-white/70">{day}</span>
                      </label>
                    ))}
                  </div>
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
                        specialty: '',
                        price: '',
                            phone: '',
                        workingDays: [],
                            avatarFile: null,
                            avatarPreview: '',
                            uploadingAvatar: false,
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
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex gap-4 mb-4">
                  <img
                    src={barber.image}
                    alt={barber.name}
                          className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{barber.name}</h3>
                    <p className="text-sm text-ios-textMuted">
                      {barber.specialty}
                    </p>
                            {barber.phone && (
                              <p className="text-xs text-white/60">{barber.phone}</p>
                            )}
                    <p className="text-sky-400 font-medium mt-1">
                      ${barber.price}
                    </p>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-t border-white/10">
                  <p className="text-xs text-white/60 mb-2 uppercase">
                    Working Days
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {barber.workingDays.map((day) => (
                      <span
                        key={day}
                        className="inline-block px-2 py-1 rounded text-xs bg-sky-500/20 border border-sky-500/30 text-sky-300"
                      >
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
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
      </div>
    </div>
  );
}
