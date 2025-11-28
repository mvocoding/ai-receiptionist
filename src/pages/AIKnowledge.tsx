import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import AgentSettingsTab from '../components/AgentSettingsTab';
import FunctionDescriptionsTab from '../components/FunctionDescriptionsTab';
import { supabase, type AgentFunctionDescription } from '../lib/supabase';
import type { PromptSection } from '../lib/types-global';

const tabMenu = [
  { id: 'settings', label: 'Agent Settings' },
  { id: 'functions', label: 'Function Descriptions' },
];

const channelMenu = [
  { value: 'call', label: 'Voice Calls' },
  { value: 'sms', label: 'SMS / Text' },
];

const starterSections: PromptSection[] = [
  { title: 'Role', content: "You are Fade Station's AI receptionist." },
  {
    title: 'Workflow',
    content: '1. Greet the customer\n2. Gather their info\n3. Help with bookings.',
  },
  { title: 'Guidelines', content: 'Be concise, never guess, prefer function calls.' },
];

function simpleNormalize(raw: any): PromptSection[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => ({
        title: String(item?.title ?? '').trim(),
        content: String(item?.content ?? ''),
      }))
      .filter((item) => Boolean(item.title));
  }

  if (raw && typeof raw === 'object') {
    return Object.keys(raw).map((key) => ({
      title: key,
      content: typeof raw[key] === 'string' ? raw[key] : JSON.stringify(raw[key]),
    }));
  }

  if (typeof raw === 'string') {
    try {
      return simpleNormalize(JSON.parse(raw));
    } catch {
      return [{ title: 'Prompt', content: raw }];
    }
  }

  return starterSections;
}

function simpleSerialize(list: PromptSection[]) {
  const obj: Record<string, string> = {};
  list.forEach((item) => {
    const key = item.title.trim();
    if (key) obj[key] = item.content;
  });
  return obj;
}

export default function AIKnowledge(): JSX.Element {
  const [tabId, setTabId] = useState<'settings' | 'functions'>('settings');
  const [isLoading, setIsLoading] = useState(true);
  const [saveSettingBusy, setSaveSettingBusy] = useState(false);
  const [saveFuncBusyId, setSaveFuncBusyId] = useState<string | null>(null);
  const [deleteFuncBusyId, setDeleteFuncBusyId] = useState<string | null>(null);
  const [errText, setErrText] = useState<string | null>(null);

  const [settingInfo, setSettingInfo] = useState<{
    id: string | null;
    greeting: string;
    channel: string;
    promptSections: PromptSection[];
    createdAt?: string;
    updatedAt?: string;
  }>({
    id: null,
    greeting: 'Hi! Thanks for contacting Fade Station. How can I help?',
    channel: 'call',
    promptSections: starterSections,
  });

  const [funcData, setFuncData] = useState<AgentFunctionDescription[]>([]);
  const [newFuncForm, setNewFuncForm] = useState({ function_name: '', description: '' });
  const [editFunc, setEditFunc] = useState<{ id: string; description: string } | null>(
    null
  );

  const promptJson = useMemo(
    () => JSON.stringify(simpleSerialize(settingInfo.promptSections), null, 2),
    [settingInfo.promptSections]
  );

  useEffect(() => {
    document.title = 'Fade Station · AI Knowledge';
  }, []);

  useEffect(() => {
    async function loadPageData() {
      setIsLoading(true);
      setErrText(null);
      try {
        const { data: settingRow, error: settingErr } = await supabase
          .from('agent_settings')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (settingErr) throw settingErr;

        if (settingRow) {
          setSettingInfo({
            id: settingRow.id,
            greeting: settingRow.greeting || '',
            channel: settingRow.channel || 'call',
            promptSections: simpleNormalize(settingRow.prompt_sections),
            createdAt: settingRow.created_at,
            updatedAt: settingRow.updated_at,
          });
        }

        const { data: funcRows, error: funcErr } = await supabase
          .from('agent_function_descriptions')
          .select('*')
          .order('function_name', { ascending: true });
        if (funcErr) throw funcErr;
        setFuncData(funcRows || []);
      } catch (error) {
        console.error('load ai page fail', error);
        setErrText('Unable to load data from Supabase.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadPageData();
  }, []);

  async function handleSaveSetting() {
    setSaveSettingBusy(true);
    setErrText(null);
    const body = {
      greeting: settingInfo.greeting,
      channel: settingInfo.channel,
      prompt_sections: simpleSerialize(settingInfo.promptSections),
    };
    try {
      if (settingInfo.id) {
        const { error } = await supabase
          .from('agent_settings')
          .update(body)
          .eq('id', settingInfo.id);
        if (error) throw error;
        setSettingInfo((prev) => ({ ...prev, updatedAt: new Date().toISOString() }));
      } else {
        const { data, error } = await supabase
          .from('agent_settings')
          .insert(body)
          .select()
          .single();
        if (error) throw error;
        setSettingInfo((prev) => ({
          ...prev,
          id: data.id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }));
      }
    } catch (error) {
      console.error('save setting fail', error);
      setErrText('Cannot save agent setting.');
    } finally {
      setSaveSettingBusy(false);
    }
  }

  async function handleAddFunc(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newFuncForm.function_name.trim() || !newFuncForm.description.trim()) return;
    setSaveFuncBusyId('new');
    setErrText(null);
    try {
      const { data, error } = await supabase
        .from('agent_function_descriptions')
        .insert({
          function_name: newFuncForm.function_name.trim(),
          description: newFuncForm.description.trim(),
        })
        .select()
        .single();
      if (error) throw error;
      setFuncData((prev) =>
        [...prev, data].sort((a, b) => a.function_name.localeCompare(b.function_name))
      );
      setNewFuncForm({ function_name: '', description: '' });
    } catch (error) {
      console.error('add func fail', error);
      setErrText('Cannot add new function.');
    } finally {
      setSaveFuncBusyId(null);
    }
  }

  async function handleUpdateFunc(id: string, text: string) {
    setSaveFuncBusyId(id);
    setErrText(null);
    try {
      const { error } = await supabase
        .from('agent_function_descriptions')
        .update({ description: text })
        .eq('id', id);
      if (error) throw error;
      setFuncData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, description: text } : item))
      );
      setEditFunc(null);
    } catch (error) {
      console.error('update func fail', error);
      setErrText('Cannot update function.');
    } finally {
      setSaveFuncBusyId(null);
    }
  }

  async function handleDeleteFunc(id: string) {
    if (!window.confirm('Delete this function?')) return;
    setDeleteFuncBusyId(id);
    setErrText(null);
    try {
      const { error } = await supabase
        .from('agent_function_descriptions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setFuncData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('delete func fail', error);
      setErrText('Cannot delete function.');
    } finally {
      setDeleteFuncBusyId(null);
    }
  }

  function changePromptItem(idx: number, key: keyof PromptSection, value: string) {
    setSettingInfo((prev) => {
      const dup = [...prev.promptSections];
      dup[idx] = { ...dup[idx], [key]: value };
      return { ...prev, promptSections: dup };
    });
  }

  function addPromptItem() {
    setSettingInfo((prev) => ({
      ...prev,
      promptSections: [...prev.promptSections, { title: 'New Section', content: '' }],
    }));
  }

  function removePromptItem(idx: number) {
    setSettingInfo((prev) => ({
      ...prev,
      promptSections: prev.promptSections.filter((_, i) => i !== idx),
    }));
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-white/50 uppercase tracking-wide">AI Agent</p>
          </div>
          {tabId === 'settings' && (
            <button
              onClick={handleSaveSetting}
              disabled={saveSettingBusy}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50"
            >
              {saveSettingBusy ? 'Saving...' : 'Save Agent Settings'}
            </button>
          )}
        </header>

        {errText && (
          <div className="text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
            {errText}
          </div>
        )}

        <div className="flex gap-3 border-b border-white/10">
          {tabMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setTabId(item.id as 'settings' | 'functions')}
              className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                tabId === item.id
                  ? 'border-sky-500 text-white'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center text-white/70 py-20">Loading AI knowledge...</div>
        ) : tabId === 'settings' ? (
          <AgentSettingsTab
            settings={settingInfo}
            channelOptions={channelMenu}
            promptJson={promptJson}
            onChannelChange={(val) =>
              setSettingInfo((prev) => ({ ...prev, channel: val }))
            }
            onGreetingChange={(val) =>
              setSettingInfo((prev) => ({ ...prev, greeting: val }))
            }
            onAddSection={addPromptItem}
            onRemoveSection={removePromptItem}
            onUpdateSection={changePromptItem}
          />
        ) : (
          <FunctionDescriptionsTab
            functions={funcData}
            newFunction={newFuncForm}
            editingFunction={editFunc}
            savingFunctionId={saveFuncBusyId}
            deletingFunctionId={deleteFuncBusyId}
            onAddFunction={handleAddFunc}
            onNewFunctionChange={(field, val) =>
              setNewFuncForm((prev) => ({ ...prev, [field]: val }))
            }
            onStartEditing={(id, text) => setEditFunc({ id, description: text })}
            onCancelEditing={() => setEditFunc(null)}
            onEditDescriptionChange={(text) =>
              setEditFunc((prev) => (prev ? { ...prev, description: text } : prev))
            }
            onUpdateFunction={handleUpdateFunc}
            onDeleteFunction={handleDeleteFunc}
          />
        )}
      </div>
    </div>
  );
}

