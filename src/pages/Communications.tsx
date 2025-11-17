import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';

type Message = {
  sender: 'customer' | 'ai' | 'system';
  message: string;
  time: string;
};

type Comm = {
  id: string;
  type: 'call' | 'sms' | 'recording';
  contactName: string;
  contactNumber: string;
  timestamp: string;
  status: string;
  sentiment: string;
  tag: string;
  actionTaken: string;
  aiSummary: string;
  conversation?: Message[];
  duration?: number;
  transcript?: string;
  audioUrl?: string;
};

// Combined mock data
const MOCK_DATA: Comm[] = [
  // SMS/Call communications
  {
    id: 'comm_101',
    type: 'call',
    contactName: 'Jordan Smith',
    contactNumber: '+64 21 555 1024',
    timestamp: 'Today · 10:42 AM',
    status: 'completed',
    sentiment: 'positive',
    tag: 'booking',
    actionTaken: 'Appointment booked',
    aiSummary:
      'Customer requested fade appointment for Friday afternoon. Successfully booked with Ace at 3:30pm. Confirmation sent via SMS.',
    conversation: [
      {
        sender: 'customer',
        message:
          "Hi, I'd like to book a fade for Friday afternoon if possible.",
        time: '10:42:15',
      },
      {
        sender: 'ai',
        message:
          "Hello! I'd be happy to help you book a fade appointment. What's your name and phone number?",
        time: '10:42:18',
      },
      {
        sender: 'customer',
        message: "It's Jordan, 021-555-1024. Do you have anything after 3pm?",
        time: '10:42:45',
      },
      {
        sender: 'ai',
        message:
          'Perfect! I have Ace available at 3:30pm and 4:00pm on Friday. Which would you prefer? A fade is $45.',
        time: '10:42:52',
      },
      {
        sender: 'customer',
        message: '3:30pm works great. Do I need to pay upfront?',
        time: '10:43:12',
      },
      {
        sender: 'ai',
        message:
          "No payment needed now! I've booked you with Ace for Friday at 3:30pm. You'll get a confirmation text shortly.",
        time: '10:43:18',
      },
    ],
  },
  {
    id: 'comm_102',
    type: 'sms',
    contactName: 'Emily Chen',
    contactNumber: '+64 27 880 3344',
    timestamp: 'Today · 9:15 AM',
    status: 'completed',
    sentiment: 'neutral',
    tag: 'reschedule',
    actionTaken: 'Appointment rescheduled',
    aiSummary:
      'Customer requested to move appointment from Friday to Saturday morning and change service from standard cut to line-up and taper.',
    conversation: [
      {
        sender: 'customer',
        message:
          'Hi, I need to move my appointment from Friday to Saturday morning if possible',
        time: '09:15:22',
      },
      {
        sender: 'ai',
        message:
          'I can help you reschedule! What time works best on Saturday morning?',
        time: '09:15:28',
      },
      {
        sender: 'customer',
        message:
          'Any time between 9-11am. Also can I change from standard cut to line-up and taper?',
        time: '09:15:45',
      },
      {
        sender: 'ai',
        message:
          'Perfect! I have Jay available at 10am on Saturday. Line-up and taper is $40. Should I book that?',
        time: '09:15:52',
      },
      {
        sender: 'customer',
        message: 'Yes please, that works great',
        time: '09:16:08',
      },
      {
        sender: 'ai',
        message:
          'Done! Your appointment is now Saturday 10am with Jay for line-up and taper. Confirmation sent.',
        time: '09:16:12',
      },
    ],
  },
  {
    id: 'comm_103',
    type: 'call',
    contactName: 'Unknown',
    contactNumber: 'Private',
    timestamp: 'Yesterday · 4:30 PM',
    status: 'missed',
    sentiment: 'neutral',
    tag: 'missed',
    actionTaken: 'SMS follow-up sent',
    aiSummary:
      'Missed call from private number. AI automatically sent SMS asking for preferred time and service.',
    conversation: [
      { sender: 'system', message: 'Missed call at 4:30 PM', time: '16:30:00' },
      {
        sender: 'ai',
        message:
          'Hi! We missed your call. What can I help you with today? You can reply with your preferred time and service.',
        time: '16:30:15',
      },
    ],
  },
  {
    id: 'comm_104',
    type: 'sms',
    contactName: 'Leo Martinez',
    contactNumber: '+64 22 901 7777',
    timestamp: 'Yesterday · 2:15 PM',
    status: 'completed',
    sentiment: 'negative',
    tag: 'pricing',
    actionTaken: 'Price clarification sent',
    aiSummary:
      'Customer questioned pricing from previous visit. AI provided detailed breakdown of full service pricing with beard and hot towel.',
    conversation: [
      {
        sender: 'customer',
        message:
          'I think I was charged wrong last time. Can you confirm the price for full service with beard and hot towel?',
        time: '14:15:30',
      },
      {
        sender: 'ai',
        message:
          "I'd be happy to clarify our pricing! Full service (cut + beard + hot towel) is $65. Regular cut is $45, beard trim is $15, hot towel is $5.",
        time: '14:15:45',
      },
      {
        sender: 'customer',
        message: 'That sounds right, thanks for clarifying',
        time: '14:16:12',
      },
      {
        sender: 'ai',
        message:
          "You're welcome! If you'd like to book another appointment, just let me know your preferred time.",
        time: '14:16:18',
      },
    ],
  },
  {
    id: 'rec_101',
    type: 'recording',
    contactName: 'Jordan Smith',
    contactNumber: '+64 21 555 1024',
    timestamp: 'Today · 10:42 AM',
    status: 'completed',
    sentiment: 'positive',
    tag: 'booking',
    actionTaken: 'Appointment booked',
    aiSummary:
      'Customer called requesting skin fade tomorrow after 3pm. Flexible on time. Asked about beard trim add-on pricing.',
    duration: 132,
    transcript:
      "Hey, I was wondering if you have any availability for a skin fade tomorrow after 3pm? I'm flexible on the time. Also what's the price for beard trim add-on?",
    audioUrl:
      'https://cdn.pixabay.com/download/audio/2021/09/16/audio_8c4d3f2b7d.mp3?filename=click-124467.mp3',
  },
  {
    id: 'rec_102',
    type: 'recording',
    contactName: 'Unknown',
    contactNumber: 'Private',
    timestamp: 'Today · 9:05 AM',
    status: 'missed',
    sentiment: 'neutral',
    tag: 'missed',
    actionTaken: 'Callback SMS sent',
    aiSummary:
      'Missed call. AI sent an SMS asking for preferred time and service.',
    duration: 0,
    transcript:
      'Missed call. AI sent an SMS asking for preferred time and service.',
    audioUrl: '',
  },
  {
    id: 'rec_103',
    type: 'recording',
    contactName: 'Emily Chen',
    contactNumber: '+64 27 880 3344',
    timestamp: 'Yesterday · 4:18 PM',
    status: 'completed',
    sentiment: 'neutral',
    tag: 'reschedule',
    actionTaken: 'Appointment rescheduled',
    aiSummary:
      'Customer requested to move appointment from Friday to Saturday morning and change from standard cut to line-up and taper.',
    duration: 245,
    transcript:
      'Hi, I need to move my appointment from Friday to Saturday morning if possible. Also, can I change from a standard cut to a line-up and taper?',
    audioUrl:
      'https://cdn.pixabay.com/download/audio/2022/03/15/audio_e6a3b.mp3?filename=notification-112557.mp3',
  },
];

function badgeConf(kind: 'status' | 'sentiment', value: string) {
  const map: Record<string, { text: string; cls: string }> = {
    completed: {
      text: 'Completed',
      cls: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    },
    missed: {
      text: 'Missed',
      cls: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    },
    positive: {
      text: 'Positive',
      cls: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
    },
    neutral: {
      text: 'Neutral',
      cls: 'border-white/20 text-white/80 bg-white/5',
    },
    negative: {
      text: 'Negative',
      cls: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    },
  };
  return (
    map[value] || {
      text: value,
      cls: 'border-white/20 text-white/80 bg-white/5',
    }
  );
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function Communications(): JSX.Element {
  useEffect(() => {
    document.title = 'Fade Station · Communications';
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute(
      'content',
      'Fade Station AI Receptionist · Calls, SMS, and Recordings'
    );
    if (!document.querySelector('meta[name="description"]'))
      document.head.appendChild(meta);
  }, []);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'call' | 'sms' | 'recording' | 'completed' | 'missed'
  >('all');
  const [sortNewest, setSortNewest] = useState(true);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = MOCK_DATA.filter((r) => {
      const hay =
        `${r.contactName} ${r.contactNumber} ${r.aiSummary}`.toLowerCase();
      const matchesQuery = q ? hay.includes(q) : true;
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'call'
          ? r.type === 'call'
          : filter === 'sms'
          ? r.type === 'sms'
          : filter === 'recording'
          ? r.type === 'recording'
          : r.status === filter;
      return matchesQuery && matchesFilter;
    });
    items = items.sort((a, b) =>
      sortNewest ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)
    );
    return items;
  }, [query, filter, sortNewest]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* unified nav */}
        <NavBar />

        {/* Search & filters */}
        <div className="px-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search name, number, message..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white/5 border border-ios-border rounded-xl pl-10 pr-3 py-2.5 text-sm placeholder:text-ios-textMuted focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-ios-textMuted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex bg-white/5 border border-ios-border rounded-xl p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`filter-btn px-3 py-1.5 text-xs rounded-lg ${
                    filter === 'all' ? 'bg-white/10' : ''
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('call')}
                  className={`filter-btn px-3 py-1.5 text-xs rounded-lg ${
                    filter === 'call' ? 'bg-white/10' : ''
                  }`}
                >
                  Calls
                </button>
                <button
                  onClick={() => setFilter('sms')}
                  className={`filter-btn px-3 py-1.5 text-xs rounded-lg ${
                    filter === 'sms' ? 'bg-white/10' : ''
                  }`}
                >
                  SMS
                </button>
                <button
                  onClick={() => setFilter('recording')}
                  className={`filter-btn px-3 py-1.5 text-xs rounded-lg ${
                    filter === 'recording' ? 'bg-white/10' : ''
                  }`}
                >
                  Recordings
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`filter-btn px-3 py-1.5 text-xs rounded-lg ${
                    filter === 'completed' ? 'bg-white/10' : ''
                  }`}
                >
                  Completed
                </button>
              </div>
              <button
                onClick={() => setSortNewest((s) => !s)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white/10 border border-ios-border"
              >
                Sort: {sortNewest ? 'Newest' : 'Oldest'}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="mt-4 space-y-3">
          {rows.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-ios-border rounded-2xl">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <svg
                  className="h-7 w-7 text-white/70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3 className="font-semibold">No communications found</h3>
              <p className="text-sm text-ios-textMuted">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            rows.map((r) => {
              const status = badgeConf('status' as any, r.status);
              const sentiment = badgeConf('sentiment' as any, r.sentiment);
              return (
                <section
                  key={r.id}
                  className="bg-gradient-to-b from-ios-card to-ios-card2 border border-ios-border rounded-2xl shadow-glow overflow-hidden"
                >
                  <div className="p-4 flex items-start gap-4">
                    <div className="shrink-0 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                      <svg
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {r.type === 'call' && (
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        )}
                        {r.type === 'sms' && (
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        )}
                        {r.type === 'recording' && (
                          <path d="M12 1a11 11 0 0 1 11 11v6a11 11 0 0 1-11 11H7a11 11 0 0 1-11-11v-6a11 11 0 0 1 11-11z" />
                        )}
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 justify-between mb-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-sm">
                            <span>{r.contactName}</span>{' '}
                            <span className="text-ios-textMuted font-normal">
                              ·
                            </span>{' '}
                            <span className="text-ios-textMuted">
                              {r.contactNumber}
                            </span>
                          </h3>
                          <p className="text-xs text-ios-textMuted">
                            <span>{r.timestamp}</span> ·{' '}
                            <span className="uppercase">
                              {r.type === 'recording' ? 'Recording' : r.type}
                            </span>
                            {r.duration !== undefined && (
                              <span> · {formatDuration(r.duration)}</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full ${status.cls}`}
                          >
                            {status.text}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full ${sentiment.cls}`}
                          >
                            {sentiment.text}
                          </span>
                        </div>
                      </div>

                      {/* Conversation or Transcript */}
                      {r.conversation && (
                        <div className="mt-3 space-y-2 mb-3">
                          {r.conversation.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-2 ${
                                msg.sender === 'customer'
                                  ? 'justify-end'
                                  : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] p-2 rounded-xl text-xs ${
                                  msg.sender === 'customer'
                                    ? 'bg-blue-500/20 border border-blue-500/30'
                                    : msg.sender === 'ai'
                                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                                    : 'bg-white/10 border border-white/20'
                                }`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {r.type === 'recording' && r.audioUrl && (
                        <div className="mb-3">
                          <audio controls className="w-full h-6">
                            <source src={r.audioUrl} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}

                      {/* Summary */}
                      <details className="group">
                        <summary className="list-none cursor-pointer flex items-center gap-2 text-xs text-ios-textMuted hover:text-white transition">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
                            🤖
                          </span>
                          Summary
                          <svg
                            className="ml-auto h-4 w-4 transition group-open:rotate-180"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </summary>
                        <div className="mt-2 space-y-2 text-sm leading-6">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                            <p className="text-white/90">{r.aiSummary}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                              #{r.tag}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                              {r.actionTaken}
                            </span>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* Footer controls */}
                  <div className="px-4 pb-4 flex items-center justify-between text-xs text-ios-textMuted">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                        Follow up
                      </button>
                      <button className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                        Archive
                      </button>
                    </div>
                    <a className="text-sky-400 hover:text-sky-300" href="#">
                      View full
                    </a>
                  </div>
                </section>
              );
            })
          )}
        </main>

        <footer className="py-8 text-center text-xs text-ios-textMuted">
          Fade Station · Communications
        </footer>
      </div>
    </div>
  );
}
