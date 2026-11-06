import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useClinic();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#351a50] border border-[#452267]/15 dark:border-[#ded6f4]/20 rounded-2xl shadow-xl shadow-[#452267]/10 animate-fade-slide-up text-xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && (
                <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
              {isError && (
                <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              )}
              {isWarning && (
                <div className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              )}
              {!isSuccess && !isError && !isWarning && (
                <div className="w-6 h-6 rounded-full bg-[#faf5ec] dark:bg-[#452267] text-[#452267] dark:text-[#ded6f4] flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="font-semibold text-slate-800 dark:text-[#ede8f8] leading-tight">
                {toast.message}
              </span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-[#452267] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
