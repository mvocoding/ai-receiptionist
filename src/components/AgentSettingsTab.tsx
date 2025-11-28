import React from 'react';
import type { PromptSection } from '../lib/types-global';

type ChannelOption = { value: string; label: string };

type SettingData = {
  id: string | null;
  greeting: string;
  channel: string;
  promptSections: PromptSection[];
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  settings: SettingData;
  channelOptions: ChannelOption[];
  promptJson: string;
  onChannelChange: (value: string) => void;
  onGreetingChange: (value: string) => void;
  onAddSection: () => void;
  onRemoveSection: (index: number) => void;
  onUpdateSection: (index: number, key: keyof PromptSection, value: string) => void;
};

export default function AgentSettingsTab({
  settings,
  channelOptions,
  promptJson,
  onChannelChange,
  onGreetingChange,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
}: Props): JSX.Element {
  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wide text-white/50 mb-2">
            Channel
          </label>
          <select
            value={settings.channel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            {channelOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-white/50 mb-2">
            Greeting
          </label>
          <textarea
            value={settings.greeting}
            onChange={(e) => onGreetingChange(e.target.value)}
            rows={3}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>
      </div>


      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold">Prompt Sections</p>
          <button
            onClick={onAddSection}
            className="px-3 py-1.5 rounded-xl text-xs bg-white/10 border border-white/10 hover:bg-white/15"
          >
            + Add Section
          </button>
        </div>
        <div className="space-y-4">
          {settings.promptSections.map((section, index) => (
            <div
              key={`${section.title}-${index}`}
              className="border border-white/10 rounded-xl p-4 bg-black/30 space-y-3"
            >
              <div className="flex items-center gap-2">
                <input
                  value={section.title}
                  onChange={(e) => onUpdateSection(index, 'title', e.target.value)}
                  className="flex-1 bg-transparent border-b border-white/20 text-sm focus:outline-none focus:border-white"
                  placeholder="Section title"
                />
                <button
                  onClick={() => onRemoveSection(index)}
                  className="text-xs text-rose-300 hover:text-rose-200"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={section.content}
                onChange={(e) => onUpdateSection(index, 'content', e.target.value)}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                placeholder="Instructions or reference content..."
              />
            </div>
          ))}
          {settings.promptSections.length === 0 && (
            <p className="text-sm text-white/50">No sections defined yet.</p>
          )}
        </div>
      </div>

    </section>
  );
}

