import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import {
  supabase,
  type Communication as DBCommunication,
  type CommunicationMessage as DBCommunicationMessage,
} from '../lib/supabase';
import {
  mockSmsData,
  type Comm,
  formatTimestamp,
  formatMessageTime,
  formatDuration,
} from './Communications';

type CommunicationDetailProps = {
  id?: string;
};

export default function CommunicationDetail({
  id,
}: CommunicationDetailProps): JSX.Element {
  const commId = useMemo(() => {
    if (id) return id;
    const fromPath = window.location.pathname.split('/communications/')[1];
    return fromPath ?? '';
  }, [id]);

  const [communication, setCommunication] = useState<Comm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCommunication = async () => {
      if (!commId) {
        setError('Communication id missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data: communications, error: commError } = await supabase
          .from('communications')
          .select('*')
          .eq('id', commId)
          .limit(1);

        if (commError) throw commError;

        const communicationRow: DBCommunication | undefined =
          communications?.[0];

        if (communicationRow) {
          let conversation: Message[] = [];
          const { data: messages, error: msgError } = await supabase
            .from('comm_messages')
            .select('*')
            .eq('communication_id', communicationRow.id)
            .order('message_time', { ascending: true });

          if (msgError) throw msgError;

          conversation =
            messages?.map((msg: DBCommunicationMessage) => ({
              sender: msg.sender,
              message: msg.message,
              time: formatMessageTime(msg.message_time),
            })) ?? [];

          const mapped: Comm = {
            id: communicationRow.id,
            type: communicationRow.comm_type,
            contactName: communicationRow.contact_name || 'Unknown',
            contactNumber: communicationRow.contact_number || 'Private',
            timestamp: formatTimestamp(communicationRow.timestamp),
            status: communicationRow.status,
            sentiment: communicationRow.sentiment || undefined,
            tag: communicationRow.tag || undefined,
            actionTaken: communicationRow.action_taken || undefined,
            aiSummary: communicationRow.ai_summary || undefined,
            meaning: communicationRow.ai_summary || communicationRow.tag,
            duration: communicationRow.duration || undefined,
            audioUrl: communicationRow.audio_url || undefined,
            conversation,
          };

          setCommunication(mapped);
          return;
        }

        const mock = mockSmsData.find((entry) => entry.id === commId) ?? null;
        if (mock) {
          setCommunication(mock);
          return;
        }

        setError('Communication not found.');
      } catch (err) {
        console.error('Error loading communication detail:', err);
        setError('Failed to load communication.');
      } finally {
        setLoading(false);
      }
    };

    void loadCommunication();
  }, [commId]);

  const navigate = (to: string) => {
    if ((window as any).__navigate) {
      (window as any).__navigate(to);
    } else {
      window.location.href = to;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <button
          onClick={() => navigate('/communications')}
          className="text-sm text-white/70 hover:text-white transition"
        >
          ← Back to Communications
        </button>

        <header>
          <p className="text-sm uppercase tracking-wide text-white/50">
            Communication Detail
          </p>
          <h1 className="text-3xl font-semibold mt-1">
            {communication?.contactName ?? 'Conversation'}
          </h1>
          <p className="text-white/50 mt-1">{communication?.contactNumber}</p>
        </header>

        {loading && (
          <div className="text-center text-white/70 py-12">
            Loading communication…
          </div>
        )}

        {!loading && error && (
          <div className="text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
            {error}
          </div>
        )}

        {!loading && !error && communication && (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <p className="text-sm text-white/60">Summary</p>
                <h2 className="text-xl font-semibold mt-1">Context</h2>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-white/50">Timestamp</dt>
                  <dd>{communication.timestamp}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/50">Status</dt>
                  <dd className="capitalize">{communication.status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/50">Sentiment</dt>
                  <dd>{communication.sentiment ?? '--'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/50">Meaning</dt>
                  <dd className="text-right max-w-[180px]">
                    {communication.meaning ?? communication.aiSummary ?? '--'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/50">Action</dt>
                  <dd className="text-right max-w-[180px]">
                    {communication.actionTaken ?? '--'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/50">Duration</dt>
                  <dd>
                    {communication.duration
                      ? formatDuration(communication.duration)
                      : '--'}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">
                    Conversation
                  </p>
                  <h2 className="text-xl font-semibold">
                    {communication.type === 'sms' ? 'SMS Thread' : 'Call Notes'}
                  </h2>
                </div>
                <p className="text-sm text-white/60">
                  {communication.conversation?.length ?? 0} messages
                </p>
              </div>
              <div className="space-y-4">
                {communication.conversation && communication.conversation.length > 0 ? (
                  communication.conversation.map((msg, idx) => (
                    <div
                      key={`${msg.sender}-${idx}`}
                      className="rounded-2xl border border-white/10 p-4 bg-black/40"
                    >
                      <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                        <span className="uppercase tracking-wide">
                          {msg.sender}
                        </span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-white/90 leading-relaxed">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-white/50 text-center py-8 border border-dashed border-white/10 rounded-2xl">
                    No conversation messages captured.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

type Message = {
  sender: 'customer' | 'ai' | 'system';
  message: string;
  time: string;
};

