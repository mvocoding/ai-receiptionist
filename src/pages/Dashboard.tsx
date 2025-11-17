import React, { useEffect, useState } from 'react';

type Barber = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  price: number;
};

type StoreSettings = {
  bannerUrl: string;
  introText: string;
};

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
    },
    {
      id: 'jay',
      name: 'Jay',
      specialty: 'Tapers · Line-ups',
      image:
        'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=80&w=200&h=200',
      price: 40,
    },
    {
      id: 'mia',
      name: 'Mia',
      specialty: 'Skin Fades · Scissor',
      image:
        'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=200&h=200',
      price: 45,
    },
  ]);

  const [showAddBarber, setShowAddBarber] = useState(false);
  const [newBarber, setNewBarber] = useState({
    name: '',
    specialty: '',
    price: '',
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

  const handleAddBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newBarber.name.trim() ||
      !newBarber.specialty.trim() ||
      !newBarber.price.trim()
    ) {
      alert('Please fill in all fields');
      return;
    }
    const barber: Barber = {
      id: `barber_${Date.now()}`,
      name: newBarber.name,
      specialty: newBarber.specialty,
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
      price: Number(newBarber.price),
    };
    setBarbers([...barbers, barber]);
    setNewBarber({ name: '', specialty: '', price: '' });
    setShowAddBarber(false);
    alert('Barber added successfully!');
  };

  const deleteBarber = (id: string) => {
    setBarbers(barbers.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <span className="text-xs font-semibold">FS</span>
              </div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <a
                href="/landing"
                className="px-3 py-1.5 rounded-lg text-xs text-ios-textMuted hover:text-white transition"
              >
                Home
              </a>
              <a
                href="/communications"
                className="px-3 py-1.5 rounded-lg text-xs text-ios-textMuted hover:text-white transition"
              >
                Communications
              </a>
              <a
                href="/barbers"
                className="px-3 py-1.5 rounded-lg text-xs text-ios-textMuted hover:text-white transition"
              >
                Barbers
              </a>
            </div>
          </div>
        </div>
      </div>

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

        {/* Store Intro Section */}
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
              onClick={() => setShowAddBarber(!showAddBarber)}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 transition font-medium text-sm"
            >
              + Add Barber
            </button>
          </div>

          {showAddBarber && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Add New Barber</h3>
              <form onSubmit={handleAddBarber} className="space-y-4">
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
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition font-medium"
                  >
                    Add Barber
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddBarber(false)}
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
                <div className="flex gap-4">
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
                  <button
                    onClick={() => deleteBarber(barber.id)}
                    className="self-start px-3 py-1.5 text-xs rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 transition"
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
