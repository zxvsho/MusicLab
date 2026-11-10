import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-12 right-4 z-50 flex flex-col gap-2 max-w-sm w-full font-mono text-xs pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3 rounded-lg border shadow-xl flex items-start justify-between gap-2.5 transition-all bg-[#1a1b26] ${
              isSuccess
                ? 'border-[#9ece6a] text-[#9ece6a]'
                : isError
                ? 'border-[#f7768e] text-[#f7768e]'
                : 'border-[#7aa2f7] text-[#7aa2f7]'
            }`}
          >
            <div className="flex items-start gap-2 min-w-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
              {isError && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className="text-[#c0caf5] text-[11px] leading-relaxed break-words">{t.message}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-[#565f89] hover:text-[#c0caf5] p-0.5 rounded shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
