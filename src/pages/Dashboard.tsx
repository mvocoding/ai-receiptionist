import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

type Barber = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  price: number;
  workingDays: string[];
};

type StoreSettings = {
  bannerUrl: string;
  introText: string;
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

  const [settings, setSettings] = useState<StoreSettings>({
    bannerUrl:
      'https://images.unsplash.com/photo-1585191905284-8645af60f856?auto=format&fit=crop&q=80&w=800',
    introText: 'Welcome to Fade Station. Premium Barbershop Experience.',
  });

  const [barbers, setBarbers] = useState<Barber[]>([
    {
      id: 'ace',
      name: 'Ace',
      specialty: 'Fades · Beard · Kids',
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
      id: 'jay',
      name: 'Jay',
      specialty: 'Tapers · Line-ups',
      image:
        'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=80&w=200&h=200',
      price: 40,
      workingDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    },
    {
      id: 'mia',
      name: 'Mia',
      specialty: 'Skin Fades · Scissor',
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
  ]);

  const [showAddBarber, setShowAddBarber] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [newBarber, setNewBarber] = useState({
    name: '',
    specialty: '',
    price: '',
    workingDays: [] as string[],
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings((prev) => ({
          ...prev,
          bannerUrl: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
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

  const handleAddBarber = (e: React.FormEvent) => {
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
    const barber: Barber = {
      id: `barber_${Date.now()}`,
      name: newBarber.name,
      specialty: newBarber.specialty,
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
      price: Number(newBarber.price),
      workingDays: newBarber.workingDays,
    };
    setBarbers([...barbers, barber]);
    setNewBarber({ name: '', specialty: '', price: '', workingDays: [] });
    setShowAddBarber(false);
    alert('Barber added successfully!');
  };

  const handleEditBarber = (barber: Barber) => {
    setEditingBarber(barber);
    setNewBarber({
      name: barber.name,
      specialty: barber.specialty,
      price: String(barber.price),
      workingDays: barber.workingDays,
    });
  };

  const handleUpdateBarber = (e: React.FormEvent) => {
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
    setBarbers(
      barbers.map((b) =>
        b.id === editingBarber.id
          ? {
              ...b,
              name: newBarber.name,
              specialty: newBarber.specialty,
              price: Number(newBarber.price),
              workingDays: newBarber.workingDays,
            }
          : b
      )
    );
    setEditingBarber(null);
    setNewBarber({ name: '', specialty: '', price: '', workingDays: [] });
    alert('Barber updated successfully!');
  };

  const deleteBarber = (id: string) => {
    setBarbers(barbers.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* unified nav */}
      <NavBar />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Store Banner</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="mb-4">
              <img
                src={settings.bannerUrl}
                alt="Store Banner"
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Upload Banner Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-500/90 file:text-white file:cursor-pointer"
              />
              <p className="text-xs text-ios-textMuted mt-2">
                Recommended size: 1200x400px
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Store Introduction</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <label className="block text-sm font-medium text-white/70 mb-2">
              Store Description
            </label>
            <textarea
              value={settings.introText}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, introText: e.target.value }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
              rows={4}
              placeholder="Enter your store introduction..."
            />
            <button
              onClick={() => alert('Store intro saved!')}
              className="mt-4 px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition font-medium"
            >
              Save Changes
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
                  workingDays: [],
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
                        workingDays: [],
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
