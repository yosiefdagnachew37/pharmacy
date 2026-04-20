import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message?: any;
}

// Global toast state (simple singleton pattern for use without Context)
let toastQueue: ToastMessage[] = [];
let listeners: ((toasts: ToastMessage[]) => void)[] = [];
let nextId = 1;

export function toast(type: ToastType, title: string, message?: string) {
  const newToast: ToastMessage = { id: nextId++, type, title, message };
  toastQueue = [...toastQueue, newToast];
  listeners.forEach(l => l(toastQueue));

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== newToast.id);
    listeners.forEach(l => l(toastQueue));
  }, 5000);
}

export const toastSuccess = (title: string, message?: string) => toast('success', title, message);
export const toastError = (title: string, message?: string) => toast('error', title, message);
export const toastWarning = (title: string, message?: string) => toast('warning', title, message);
export const toastInfo = (title: string, message?: string) => toast('info', title, message);

const iconMap = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  error: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />,
};

const bgMap = {
  success: 'bg-white border-l-4 border-emerald-500',
  error: 'bg-white border-l-4 border-rose-500',
  warning: 'bg-white border-l-4 border-amber-500',
  info: 'bg-white border-l-4 border-indigo-500',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (q: ToastMessage[]) => setToasts([...q]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const dismiss = (id: number) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    listeners.forEach(l => l(toastQueue));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${bgMap[t.type]} rounded-xl shadow-xl p-3 flex items-start gap-2.5 pointer-events-auto animate-in slide-in-from-right duration-300 border border-gray-100`}
        >
          <div className="mt-0.5">{iconMap[t.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-gray-900 leading-tight uppercase tracking-tight">{t.title}</p>
            {t.message && (
              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug whitespace-pre-line font-medium">
                {typeof t.message === 'string'
                  ? t.message
                  : Array.isArray(t.message)
                    ? t.message.join(', ')
                    : typeof t.message === 'object'
                      ? t.message.message || JSON.stringify(t.message)
                      : String(t.message)}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
