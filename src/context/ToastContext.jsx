import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(undefined);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = 'info') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none px-4 w-full max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full text-center px-4 py-3 rounded-xl text-[14px] font-medium shadow-lg
              animate-in fade-in slide-in-from-bottom-2
              ${t.variant === 'error' ? 'bg-[var(--negative)] text-white' : ''}
              ${t.variant === 'success' ? 'bg-[var(--work-strong)] text-white' : ''}
              ${t.variant === 'info' ? 'bg-[var(--ink)] text-[var(--paper)]' : ''}
            `}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
