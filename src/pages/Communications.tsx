import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { supabase, type Conversation as DBConversation } from '../lib/supabase';
import type { Message, Comm } from '../lib/types-global';

function readableTime(ts?: string | null) {
  if (!ts) return '';
  return new Date(ts).toLocaleString();
}

function readableMsgTime(ts?: string | null) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString();
}

export default function Communications(): JSX.Element {
  const [listConvo, setListConvo] = useState<Comm[]>([]);
  const [loading, setLoading] = useState(true);
  const [errText, setErrText] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Fade Station · Communications';
  }, []);

  useEffect(() => {
    async function loadConvo() {
      setLoading(true);
      setErrText(null);
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*, users:users!conversations_user_id_fkey(name, phone_number)')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const mapped: Comm[] =
          (data as DBConversation[] | null)?.map((item) => {
            const joinedUser = (item as any)?.users;
            const msgList = Array.isArray(item.messages) ? item.messages : [];
            const cleanMsg: Message[] = msgList.map((msg) => {
              const senderRaw = String(msg?.sender ?? msg?.role ?? 'system').toLowerCase();
              const sender: Message['sender'] =
                senderRaw === 'customer' || senderRaw === 'user'
                  ? 'customer'
                  : senderRaw === 'ai' || senderRaw === 'assistant'
                  ? 'ai'
                  : 'system';
              const text =
                msg?.message ?? msg?.text ?? msg?.content ?? msg?.body ?? '[no message]';
              return {
                sender,
                message: typeof text === 'string' ? text : JSON.stringify(text),
                time: readableMsgTime(msg?.timestamp ?? msg?.created_at ?? msg?.time ?? null),
              };
            });

            return {
              id: item.id,
              type: 'sms',
              contactName: joinedUser?.name || item.phone_number || 'Unknown',
              contactNumber: item.phone_number || 'Private',
              timestamp: readableTime(item.updated_at || item.created_at),
              status: 'conversation',
              conversation: cleanMsg,
            };
          }) ?? [];

        setListConvo(mapped);
      } catch (err) {
        console.error('load conversations fail', err);
        setErrText('Failed to load conversations from Supabase.');
      } finally {
        setLoading(false);
      }
    }

    void loadConvo();
  }, []);

  const goTo = (to: string) => {
    const nav = (window as any).__navigate;
    if (nav) nav(to);
    else window.location.href = to;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">Communications</h1>
          <p className="text-white/60 mt-3 max-w-2xl">
            Live view of SMS or calls from Fade Station AI receptionist.
          </p>
        </header>

        {loading && <p className="text-center text-white/70 py-8">Loading conversations…</p>}
        {!loading && errText && (
          <div className="text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
            {errText}
          </div>
        )}
        {!loading && !errText && listConvo.length === 0 && (
          <div className="text-white/60 text-center py-12 border border-dashed border-white/20 rounded-2xl">
            No conversations yet.
          </div>
        )}
        {!loading && !errText && listConvo.length > 0 && (
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-white/60 uppercase text-xs border-b border-white/10">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Contact</th>
                    <th className="py-3 pr-4 font-medium">Number</th>
                    <th className="py-3 pr-4 font-medium">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {listConvo.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                      onClick={() => goTo(`/communications/${item.id}`)}
                    >
                      <td className="py-3 pr-4">{item.contactName}</td>
                      <td className="py-3 pr-4">{item.contactNumber}</td>
                      <td className="py-3 pr-4">{item.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
