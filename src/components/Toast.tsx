import React, { createContext, useContext, useCallback, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';
type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
};

const ToastContext = createContext<{
  success: (msg: string, title?: string) => void;
  error: (msg: string, title?: string) => void;
  info: (msg: string, title?: string) => void;
} | null>(null);

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = `${Math.floor(Math.random() * 1000000)}`;
      setToasts((s) => [...s, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((s) => s.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const value = {
    success: (m: string, t?: string) => push('success', m, t),
    error: (m: string, t?: string) => push('error', m, t),
    info: (m: string, t?: string) => push('info', m, t),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-6 right-6 z-50 flex flex-col gap-3"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-lg w-full rounded-lg p-3 shadow-lg border ${
              t.type === 'success'
                ? 'bg-emerald-600/90 border-emerald-400 text-white'
                : t.type === 'error'
                ? 'bg-rose-600/90 border-rose-400 text-white'
                : 'bg-white/90 border-white/20 text-black'
            }`}
          >
            {t.title && <div className="font-semibold mb-1">{t.title}</div>}
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: (m: string) => {
        console.info('toast success:', m);
      },
      error: (m: string) => {
        console.error('toast error:', m);
      },
      info: (m: string) => {
        console.info('toast info:', m);
      },
    };
  }
  return ctx;
}
