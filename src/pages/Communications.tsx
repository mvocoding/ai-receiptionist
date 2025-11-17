import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import {
  supabase,
  type Communication as DBCommunication,
  type CommunicationMessage as DBCommunicationMessage,
} from '../lib/supabase';

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
  sentiment?: string;
  tag?: string;
  actionTaken?: string;
  aiSummary?: string;
  conversation?: Message[];
  duration?: number;
  audioUrl?: string;
};

function formatDuration(seconds?: number | null): string | undefined {
  if (seconds === undefined || seconds === null) return undefined;
  if (seconds === 0) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatTimestamp(ts?: string | null): string {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

function formatMessageTime(ts?: string | null): string {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
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

  const [rows, setRows] = useState<Comm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: communications, error: commError } = await supabase
          .from('communications')
          .select('*')
          .order('timestamp', { ascending: false });

        if (commError) throw commError;

        const ids = (communications || []).map((c) => c.id);
        let messagesMap: Record<string, DBCommunicationMessage[]> = {};

        if (ids.length > 0) {
          const { data: messages, error: msgError } = await supabase
            .from('comm_messages')
            .select('*')
            .in('communication_id', ids)
            .order('message_time', { ascending: true });

          if (msgError) throw msgError;

          (messages || []).forEach((msg) => {
            if (!messagesMap[msg.communication_id]) {
              messagesMap[msg.communication_id] = [];
            }
            messagesMap[msg.communication_id].push(msg);
          });
        }

        const mapped: Comm[] = (communications || []).map((comm: DBCommunication) => ({
          id: comm.id,
          type: comm.comm_type,
          contactName: comm.contact_name || 'Unknown',
          contactNumber: comm.contact_number || 'Private',
          timestamp: formatTimestamp(comm.timestamp),
          status: comm.status,
          sentiment: comm.sentiment || undefined,
          tag: comm.tag || undefined,
          actionTaken: comm.action_taken || undefined,
          aiSummary: comm.ai_summary || undefined,
          duration: comm.duration || undefined,
          audioUrl: comm.audio_url || undefined,
          conversation: (messagesMap[comm.id] || []).map((msg) => ({
            sender: msg.sender,
            message: msg.message,
            time: formatMessageTime(msg.message_time),
          })),
        }));

        setRows(mapped);
      } catch (err) {
        console.error('Error loading communications:', err);
        setError('Failed to load communications from Supabase.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, []);

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
          {loading && (
            <div className="text-white/70 text-center py-8">
              Loading communications…
            </div>
          )}
          {error && !loading && (
            <div className="text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
              {error}
            </div>
          )}
          {!loading && rows.length === 0 && (
            <div className="text-white/60 text-center py-12 border border-dashed border-white/20 rounded-2xl">
              No communications found.
            </div>
          )}
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
                      {r.duration !== undefined && r.duration !== null && (
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
