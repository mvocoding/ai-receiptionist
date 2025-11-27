import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import {
  supabase,
  type Communication as DBCommunication,
  type CommunicationMessage as DBCommunicationMessage,
} from '../lib/supabase';

import type { Message, Comm } from '../lib/types-global';

export function formatDuration(seconds?: number | null): string | undefined {
  if (seconds === undefined || seconds === null) return undefined;
  if (seconds === 0) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function formatTimestamp(ts?: string | null): string {
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

export function formatMessageTime(ts?: string | null): string {
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
  const [selectedType, setSelectedType] = useState<'sms' | 'call'>('sms');
  const navigate = (to: string) => {
    if ((window as any).__navigate) {
      (window as any).__navigate(to);
    } else {
      window.location.href = to;
    }
  };

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

        const mapped: Comm[] = (communications || []).map(
          (comm: DBCommunication) => ({
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
            meaning: comm.ai_summary || comm.tag || undefined,
            duration: comm.duration || undefined,
            audioUrl: comm.audio_url || undefined,
            conversation: (messagesMap[comm.id] || []).map((msg) => ({
              sender: msg.sender,
              message: msg.message,
              time: formatMessageTime(msg.message_time),
            })),
          })
        );

        const combined = mapped;
        const deduped = combined.reduce<Comm[]>((acc, entry) => {
          if (!acc.find((item) => item.id === entry.id)) acc.push(entry);
          return acc;
        }, []);

        setRows(deduped);
      } catch (err) {
        console.error('Error loading communications:', err);
        setError('Failed to load communications from Supabase.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, []);

  const smsRows = rows.filter((row) => row.type === 'sms');
  const callRows = rows.filter(
    (row) => row.type === 'call' || row.type === 'recording'
  );
  const filteredRows = selectedType === 'sms' ? smsRows : callRows;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">Communications</h1>
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
          {!loading && rows.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Inbox</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedType('sms')}
                    className={`w-full text-left border rounded-2xl px-5 py-6 transition ${
                      selectedType === 'sms'
                        ? 'bg-white text-black border-white'
                        : 'bg-black/20 border-white/10 text-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/60">
                        Message
                      </p>
                      <h3 className="text-lg font-semibold mt-1">SMS Inbox</h3>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedType('call')}
                    className={`w-full text-left border rounded-2xl px-5 py-6 transition ${
                      selectedType === 'call'
                        ? 'bg-white text-black border-white'
                        : 'bg-black/20 border-white/10 text-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/60">
                        Call
                      </p>
                      <h3 className="text-lg font-semibold mt-1">Calls Log</h3>
                    </div>
                  </button>
                </div>
              </section>

              <section className="bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/60">
                      {selectedType === 'sms' ? 'Message' : 'Call'} Records
                    </p>
                    <h2 className="text-xl font-semibold">
                      {selectedType === 'sms' ? 'SMS' : 'Call'} Table
                    </h2>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-white/60 uppercase text-xs border-b border-white/10">
                      <tr>
                        <th className="py-3 pr-4 font-medium">Contact</th>
                        <th className="py-3 pr-4 font-medium">Number</th>
                        <th className="py-3 pr-4 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
                          onClick={() => navigate(`/communications/${r.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(`/communications/${r.id}`);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Open details for ${r.contactName}`}
                        >
                          <td className="py-3 pr-4">{r.contactName}</td>
                          <td className="py-3 pr-4">{r.contactNumber}</td>
                          <td className="py-3 pr-4">{r.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
