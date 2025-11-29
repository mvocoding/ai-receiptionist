import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import { supabase, type Conversation as DBConversation } from '../lib/supabase';
import type { Message, Comm } from '../lib/types-global';
import { toLongTime, toShortTime } from '../lib/utils';

type Props = { id?: string };

export default function CommunicationDetail({ id }: Props): JSX.Element {
  const targetId = useMemo(() => {
    if (id) return id;
    const fromPath = window.location.pathname.split('/communications/')[1];
    return fromPath ?? '';
  }, [id]);

  const [detail, setDetail] = useState<Comm | null>(null);
  const [loading, setLoading] = useState(true);
  const [errText, setErrText] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      if (!targetId) {
        setErrText('Communication id missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrText(null);
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(
            '*, users:users!conversations_user_id_fkey(name, phone_number)'
          )
          .eq('id', targetId)
          .maybeSingle<DBConversation>();

        if (error) throw error;
        if (!data) {
          setErrText('Conversation not found.');
          return;
        }

        const listMsg = Array.isArray(data.messages) ? data.messages : [];
        const cleanMsg: Message[] =
          listMsg.map((msg: any) => {
            const senderRaw = String(
              msg?.sender ?? msg?.role ?? 'system'
            ).toLowerCase();

            let sender: Message['sender'] = 'system';
            if (senderRaw === 'customer' || senderRaw === 'user') {
              sender = 'customer';
            } else if (senderRaw === 'ai' || senderRaw === 'assistant') {
              sender = 'ai';
            }

            const text =
              ['message', 'text', 'content', 'body']
                .map((key) => msg?.[key])
                .find((v) => v) || '[no message]';

            return {
              sender,
              message: typeof text === 'string' ? text : JSON.stringify(text),
              time: toShortTime(msg?.timestamp ?? msg?.created_at ?? null),
            };
          }) ?? [];

        const joinedUser = (data as any)?.users;
        setDetail({
          id: data.id,
          type: 'sms',
          contactName: joinedUser?.name || data.phone_number || 'Unknown',
          contactNumber: data.phone_number || 'Private',
          timestamp: toLongTime(data.updated_at || data.created_at),
          status: 'conversation',
          conversation: cleanMsg,
        });
      } catch (error) {
        console.error('load conversation detail fail', error);
        setErrText('Failed to load conversation.');
      } finally {
        setLoading(false);
      }
    }

    void loadDetail();
  }, [targetId]);

  const goBack = () => {
    const gotopage = (window as any).gotopage;
    if (gotopage) gotopage('/communications');
    else window.location.href = '/communications';
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <button
          onClick={goBack}
          className="text-sm text-white/70 hover:text-white transition"
        >
          ← Back
        </button>

        {loading && (
          <div className="text-center text-white/70 py-12">
            Loading communication…
          </div>
        )}
        {!loading && errText && (
          <div className="text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
            {errText}
          </div>
        )}

        {!loading && !errText && detail && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <h2 className="text-xl font-semibold mt-1">
                  {detail.contactName}
                </h2>
                <p className="text-white/50 text-sm">{detail.contactNumber}</p>
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-xl font-semibold">Messages</h2>
              {detail.conversation && detail.conversation.length > 0 ? (
                detail.conversation.map((msg, index) => (
                  <article
                    key={`${msg.sender}-${index}`}
                    className="rounded-2xl border border-white/10 p-4 bg-black/40"
                  >
                    <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                      <span className="uppercase tracking-wide">
                        {msg.sender}
                      </span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-white/90 leading-relaxed">
                      {msg.message}
                    </p>
                  </article>
                ))
              ) : (
                <div className="text-white/50 text-center py-8 border border-dashed border-white/10 rounded-2xl">
                  No conversation messages found.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
