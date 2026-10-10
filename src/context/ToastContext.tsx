import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: string, message?: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((t: string, m?: string) => addToast(t, m, 'success'), [addToast]);
  const error = useCallback((t: string, m?: string) => addToast(t, m, 'error'), [addToast]);
  const warning = useCallback((t: string, m?: string) => addToast(t, m, 'warning'), [addToast]);
  const info = useCallback((t: string, m?: string) => addToast(t, m, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-sm transition-all animate-in slide-in-from-bottom-2 ${
              item.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-700/60 text-emerald-100 shadow-emerald-950/40 backdrop-blur-md'
                : item.type === 'error'
                ? 'bg-rose-950/90 border-rose-700/60 text-rose-100 shadow-rose-950/40 backdrop-blur-md'
                : item.type === 'warning'
                ? 'bg-amber-950/90 border-amber-700/60 text-amber-100 shadow-amber-950/40 backdrop-blur-md'
                : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/40 backdrop-blur-md'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {item.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {item.type === 'info' && <Info className="w-4 h-4 text-teal-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs tracking-wide">{item.title}</p>
              {item.message && <p className="text-xs opacity-85 mt-0.5 leading-relaxed">{item.message}</p>}
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
