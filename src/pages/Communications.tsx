import React, { useEffect } from 'react';
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

const MOCK_DATA: Comm[] = [
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

  // Sort by newest first
  const rows = MOCK_DATA.sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="text-white/60 mt-3 max-w-2xl">
            Live view of calls, SMS, and recordings handled by the Fade Station
            AI receptionist.
          </p>
        </header>

        <main className="space-y-4">
          {rows.map((r) => (
            <section
              key={r.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-12 w-12 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                  <svg
                    className="h-6 w-6 text-sky-400"
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
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1">
                      {r.contactName}
                    </h3>
                    <p className="text-sm text-white/60">
                      {r.contactNumber} · {r.timestamp}
                      {r.duration !== undefined && (
                        <span> · {formatDuration(r.duration)}</span>
                      )}
                    </p>
                  </div>

                  {r.conversation && (
                    <div className="mt-4 space-y-2.5">
                      {r.conversation.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.sender === 'customer'
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                              msg.sender === 'customer'
                                ? 'bg-sky-500 text-white'
                                : msg.sender === 'ai'
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'bg-white/5 text-white/70 border border-white/10'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {r.type === 'recording' && r.audioUrl && (
                    <div className="mt-4">
                      <audio controls className="w-full h-10 rounded-lg">
                        <source src={r.audioUrl} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
