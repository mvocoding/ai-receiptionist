import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import AgentSettingsTab from '../components/AgentSettingsTab';
import FunctionDescriptionsTab from '../components/FunctionDescriptionsTab';
import { supabase, type AgentFunctionDescription } from '../lib/supabase';
import { useToast } from '../components/Toast';
import type { PromptSection } from '../lib/types-global';

const tabOptions = [
  { id: 'settings', label: 'AI Helper Settings' },
  { id: 'functions', label: 'Helper Abilities List' },
];

const communicationTypeOptions = [
  { value: 'call', label: 'Voice Calls' },
  { value: 'sms', label: 'SMS Messages' },
];

const initialPromptSections: PromptSection[] = [
  { title: 'Role', content: "You are Fade Station's AI receptionist." },
  {
    title: 'Steps to Follow',
    content:
      '1. Greet the customer\n2. Gather their info\n3. Help with bookings.',
  },
  {
    title: 'Rules',
    content:
      'Be concise, never guess, prefer using your abilities (functions).',
  },
];

function convertToSectionList(raw: any): PromptSection[] {
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
      content:
        typeof raw[key] === 'string' ? raw[key] : JSON.stringify(raw[key]),
    }));
  }

  if (typeof raw === 'string') {
    try {
      return convertToSectionList(JSON.parse(raw));
    } catch {
      return [{ title: 'Prompt', content: raw }];
    }
  }

  return initialPromptSections;
}

function convertSectionListToObject(list: PromptSection[]) {
  const obj: Record<string, string> = {};
  list.forEach((item) => {
    const key = item.title.trim();
    if (key) obj[key] = item.content;
  });
  return obj;
}

export default function AIKnowledgePage(): JSX.Element {
  const toast = useToast();

  const [currentTab, setCurrentTab] = useState<'settings' | 'functions'>(
    'settings'
  );
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [savingFuncId, setSavingFuncId] = useState<string | null>(null);
  const [deletingFuncId, setDeletingFuncId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [allSettingsMap, setAllSettingsMap] = useState<
    Record<
      string,
      {
        id: string | null;
        greeting: string;
        channel: string;
        promptSections: PromptSection[];
        createdAt?: string;
        updatedAt?: string;
      }
    >
  >({});

  const [currentSettingInfo, setCurrentSettingInfo] = useState<{
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
    promptSections: initialPromptSections,
  });

  const [functionDataList, setFunctionDataList] = useState<
    AgentFunctionDescription[]
  >([]);

  const [newFunctionForm, setNewFunctionForm] = useState({
    function_name: '',
    description: '',
  });

  const [functionToEdit, setFunctionToEdit] = useState<{
    id: string;
    description: string;
  } | null>(null);

  const promptAsJsonText = useMemo(
    () =>
      JSON.stringify(
        convertSectionListToObject(currentSettingInfo.promptSections),
        null,
        2
      ),
    [currentSettingInfo.promptSections]
  );

  useEffect(() => {
    async function loadAllAIPageData() {
      setIsPageLoading(true);
      setErrorMessage(null);
      try {
        const { data: settingRows, error: settingErr } = await supabase
          .from('agent_settings')
          .select('*')
          .order('created_at', { ascending: true });

        if (settingErr) throw settingErr;

        const settingsMap: Record<string, typeof currentSettingInfo> = {};

        settingRows.forEach((row: any) => {
          const communicationType = row.channel ?? 'call';
          settingsMap[communicationType] = {
            id: row.id,
            greeting: row.greeting || '',
            channel: communicationType,
            promptSections: convertToSectionList(row.prompt_sections),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          };
        });

        communicationTypeOptions.forEach((c) => {
          if (!settingsMap[c.value]) {
            settingsMap[c.value] = {
              id: null,
              greeting:
                c.value === 'call'
                  ? 'Hi! Thanks for contacting Fade Station. How can I help?'
                  : 'Hi! How can I help you today?',
              channel: c.value,
              promptSections: initialPromptSections,
            };
          }
        });

        setAllSettingsMap(settingsMap);

        const initialSetting =
          settingsMap[currentSettingInfo.channel] ||
          settingsMap['call'] ||
          Object.values(settingsMap)[0];
        if (initialSetting) setCurrentSettingInfo(initialSetting);

        const { data: funcRows, error: funcErr } = await supabase
          .from('agent_function_descriptions')
          .select('*')
          .order('function_name', { ascending: true });
        if (funcErr) throw funcErr;
        setFunctionDataList(funcRows || []);
      } catch (error) {
        console.error('Failed to load AI page data:', error);
        setErrorMessage('Sorry, we could not load the data from the database.');
        toast.error('Failed to load AI settings.');
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadAllAIPageData();
  }, []);

  function selectCommunicationType(channel: string) {
    const existingSettings = allSettingsMap[channel];
    if (existingSettings) {
      setCurrentSettingInfo(existingSettings);
    }
  }

  async function handleSaveAITextSettings() {
    setIsSavingSettings(true);
    setErrorMessage(null);
    const dataToSave = {
      greeting: currentSettingInfo.greeting,
      channel: currentSettingInfo.channel,
      prompt_sections: convertSectionListToObject(
        currentSettingInfo.promptSections
      ),
    };
    try {
      if (currentSettingInfo.id) {
        const { error } = await supabase
          .from('agent_settings')
          .update(dataToSave)
          .eq('id', currentSettingInfo.id);
        if (error) throw error;

        const updatedSetting = {
          ...currentSettingInfo,
          updatedAt: new Date().toISOString(),
        };
        setAllSettingsMap((prev) => ({
          ...prev,
          [currentSettingInfo.channel]: updatedSetting,
        }));
        setCurrentSettingInfo(updatedSetting);
        toast.success('AI Helper settings saved!');
      } else {
        const { data, error } = await supabase
          .from('agent_settings')
          .insert({ ...dataToSave })
          .select()
          .single();
        if (error) throw error;

        const newSetting = {
          id: data.id,
          greeting: data.greeting || '',
          channel: data.channel || currentSettingInfo.channel,
          promptSections: convertToSectionList(data.prompt_sections),
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setAllSettingsMap((prev) => ({
          ...prev,
          [newSetting.channel]: newSetting,
        }));
        setCurrentSettingInfo(newSetting);
        toast.success('New AI Helper settings created!');
      }
    } catch (error) {
      console.error('Failed to save setting:', error);
      setErrorMessage('Cannot save the AI helper settings.');
      toast.error('Cannot save AI settings.');
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleAddNewFunction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !newFunctionForm.function_name.trim() ||
      !newFunctionForm.description.trim()
    )
      return;
    setSavingFuncId('new');
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from('agent_function_descriptions')
        .insert({
          function_name: newFunctionForm.function_name.trim(),
          description: newFunctionForm.description.trim(),
        })
        .select()
        .single();
      if (error) throw error;

      setFunctionDataList((prev) =>
        [...prev, data].sort((a, b) =>
          a.function_name.localeCompare(b.function_name)
        )
      );
      setNewFunctionForm({ function_name: '', description: '' });
      toast.success('New ability added!');
    } catch (error) {
      console.error('Failed to add new function:', error);
      setErrorMessage('Cannot add new function/ability.');
      toast.error('Cannot add new ability.');
    } finally {
      setSavingFuncId(null);
    }
  }

  async function handleUpdateFunctionDescription(id: string, text: string) {
    setSavingFuncId(id);
    setErrorMessage(null);
    try {
      const { error } = await supabase
        .from('agent_function_descriptions')
        .update({ description: text })
        .eq('id', id);
      if (error) throw error;

      setFunctionDataList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, description: text } : item
        )
      );
      setFunctionToEdit(null);
      toast.success('Ability description updated!');
    } catch (error) {
      console.error('Failed to update function:', error);
      setErrorMessage('Cannot update function/ability.');
      toast.error('Cannot update ability.');
    } finally {
      setSavingFuncId(null);
    }
  }

  async function handleDeleteFunction(id: string) {
    if (!window.confirm('Are you sure you want to delete this ability?'))
      return;
    setDeletingFuncId(id);
    setErrorMessage(null);
    try {
      const { error } = await supabase
        .from('agent_function_descriptions')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setFunctionDataList((prev) => prev.filter((item) => item.id !== id));
      toast.success('Ability deleted!');
    } catch (error) {
      console.error('Failed to delete function:', error);
      setErrorMessage('Cannot delete function/ability.');
      toast.error('Cannot delete ability.');
    } finally {
      setDeletingFuncId(null);
    }
  }

  function changePromptSectionItem(
    index: number,
    key: keyof PromptSection,
    value: string
  ) {
    setCurrentSettingInfo((prev) => {
      const listCopy = [...prev.promptSections];
      listCopy[index] = { ...listCopy[index], [key]: value };
      return { ...prev, promptSections: listCopy };
    });
  }

  function addNewPromptSection() {
    setCurrentSettingInfo((prev) => ({
      ...prev,
      promptSections: [
        ...prev.promptSections,
        { title: 'New Instruction Title', content: 'New instruction text.' },
      ],
    }));
  }

  function removePromptSection(index: number) {
    setCurrentSettingInfo((prev) => ({
      ...prev,
      promptSections: prev.promptSections.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NavBar />
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-white/50 uppercase tracking-wide">
              AI Helper
            </p>
          </div>

          {currentTab === 'settings' && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAITextSettings}
                disabled={isSavingSettings}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50"
              >
                {isSavingSettings ? 'Saving...' : 'Save AI Settings'}
              </button>
            </div>
          )}
        </header>

        {errorMessage && (
          <div className="text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-3 border-b border-white/10">
          {tabOptions.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id as 'settings' | 'functions')}
              className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                currentTab === item.id
                  ? 'border-sky-500 text-white'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isPageLoading ? (
          <div className="text-center text-white/70 py-20">
            Loading AI knowledge...
          </div>
        ) : currentTab === 'settings' ? (
          <AgentSettingsTab
            settings={currentSettingInfo}
            channelOptions={communicationTypeOptions}
            onChannelChange={(val) => selectCommunicationType(val)}
            onGreetingChange={(val) =>
              setCurrentSettingInfo((prev) => ({ ...prev, greeting: val }))
            }
            onAddSection={addNewPromptSection}
            onRemoveSection={removePromptSection}
            onUpdateSection={changePromptSectionItem}
          />
        ) : (
          <FunctionDescriptionsTab
            functions={functionDataList}
            newFunction={newFunctionForm}
            editingFunction={functionToEdit}
            savingFunctionId={savingFuncId}
            deletingFunctionId={deletingFuncId}
            onAddFunction={handleAddNewFunction}
            onNewFunctionChange={(field, val) =>
              setNewFunctionForm((prev) => ({ ...prev, [field]: val }))
            }
            onStartEditing={(id, text) =>
              setFunctionToEdit({ id, description: text })
            }
            onCancelEditing={() => setFunctionToEdit(null)}
            onEditDescriptionChange={(text) =>
              setFunctionToEdit((prev) =>
                prev ? { ...prev, description: text } : prev
              )
            }
            onUpdateFunction={handleUpdateFunctionDescription}
            onDeleteFunction={handleDeleteFunction}
          />
        )}
      </div>
    </div>
  );
}
