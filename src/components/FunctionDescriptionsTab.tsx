import React from 'react';
import type { AgentFunctionDescription } from '../lib/supabase';

type NewFunc = {
  function_name: string;
  description: string;
};

type EditingState = { id: string; description: string } | null;

type Props = {
  functions: AgentFunctionDescription[];
  newFunction: NewFunc;
  editingFunction: EditingState;
  savingFunctionId: string | null;
  deletingFunctionId: string | null;
  onAddFunction: (e: React.FormEvent<HTMLFormElement>) => void;
  onNewFunctionChange: (field: keyof NewFunc, value: string) => void;
  onStartEditing: (id: string, description: string) => void;
  onCancelEditing: () => void;
  onEditDescriptionChange: (value: string) => void;
  onUpdateFunction: (id: string, description: string) => void;
  onDeleteFunction: (id: string) => void;
};

export default function FunctionDescriptionsTab({
  functions,
  newFunction,
  editingFunction,
  savingFunctionId,
  deletingFunctionId,
  onAddFunction,
  onNewFunctionChange,
  onStartEditing,
  onCancelEditing,
  onEditDescriptionChange,
  onUpdateFunction,
  onDeleteFunction,
}: Props): JSX.Element {
  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Function Descriptions</h2>
        </div>
        <form
          onSubmit={onAddFunction}
          className="bg-black/30 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
        >
          <input
            value={newFunction.function_name}
            onChange={(e) => onNewFunctionChange('function_name', e.target.value)}
            placeholder="function name"
            className="flex-1 bg-transparent border-b border-white/20 text-sm focus:outline-none focus:border-white"
          />
          <input
            value={newFunction.description}
            onChange={(e) => onNewFunctionChange('description', e.target.value)}
            placeholder="description"
            className="flex-1 bg-transparent border-b border-white/20 text-sm focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            disabled={savingFunctionId === 'new'}
            className="px-3 py-2 rounded-lg text-xs bg-sky-500 hover:bg-sky-600 disabled:opacity-50"
          >
            {savingFunctionId === 'new' ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {functions.length === 0 ? (
          <p className="text-sm text-white/50">
            No function descriptions yet. Add one to teach the agent how to call your backend.
          </p>
        ) : (
          functions.map((funcItem) => {
            const isEditing = editingFunction?.id === funcItem.id;
            return (
              <div
                key={funcItem.id}
                className="border border-white/10 rounded-xl p-4 bg-black/30 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold">{funcItem.function_name}</p>
                    
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() =>
                            onUpdateFunction(funcItem.id, editingFunction?.description || '')
                          }
                          disabled={savingFunctionId === funcItem.id}
                          className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500/80 hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {savingFunctionId === funcItem.id ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={onCancelEditing}
                          className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onStartEditing(funcItem.id, funcItem.description)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteFunction(funcItem.id)}
                      disabled={deletingFunctionId === funcItem.id}
                      className="px-3 py-1.5 rounded-lg text-xs bg-rose-500/80 hover:bg-rose-500 disabled:opacity-50"
                    >
                      {deletingFunctionId === funcItem.id ? 'Removing...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={isEditing ? editingFunction?.description || '' : funcItem.description}
                  onChange={(e) => isEditing && onEditDescriptionChange(e.target.value)}
                  readOnly={!isEditing}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  rows={4}
                />
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

