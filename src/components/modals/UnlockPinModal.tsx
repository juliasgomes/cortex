import React, { useState, useEffect } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

interface UnlockPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UnlockPinModal: React.FC<UnlockPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { settings } = useClinic();
  const configuredPin = settings.securityPin || '1234';
  const expectedLength = configuredPin.length; // 4, 5, or 6 digits

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
    }
  }, [isOpen]);

  const verifyPin = (candidate: string) => {
    if (candidate === configuredPin) {
      onSuccess();
      setPin('');
      onClose();
    } else {
      setError('Senha incorreta. Tente novamente.');
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  // Handle hardware keyboard and physical numpad
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Digits 0-9 from top row or numpad
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (pin.length >= 4) {
          verifyPin(pin);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, configuredPin, expectedLength]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < expectedLength) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');

      // ONLY validate automatically when the exact configured length is reached
      if (nextPin.length === expectedLength) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xs bg-white dark:bg-[#452267] rounded-3xl p-6 shadow-2xl border border-[#452267]/15 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto mb-3 bg-[#452267]/10 dark:bg-white/15 text-[#452267] dark:text-white rounded-2xl flex items-center justify-center shadow-inner">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-[#452267] dark:text-white mb-1">
          Desbloquear Dados
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-5">
          Digite sua senha de {expectedLength} dígitos ({expectedLength} caracteres) pelo teclado ou botões.
        </p>

        {/* PIN Dots matching exact configured length */}
        <div className="flex justify-center gap-3 mb-5">
          {Array.from({ length: expectedLength }).map((_, idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                  isFilled
                    ? 'bg-[#452267] border-[#452267] dark:bg-white dark:border-white scale-110 shadow-xs'
                    : 'bg-slate-100 border-slate-300 dark:bg-white/10 dark:border-white/30'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 py-1.5 px-3 rounded-xl mb-4 animate-shake">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-2xl bg-[#F8F5F1] dark:bg-white/10 hover:bg-[#ede5d8] dark:hover:bg-white/20 active:scale-95 text-[#452267] dark:text-white font-bold text-lg transition-all shadow-xs cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white cursor-pointer"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-[#F8F5F1] dark:bg-white/10 hover:bg-[#ede5d8] dark:hover:bg-white/20 active:scale-95 text-[#452267] dark:text-white font-bold text-lg transition-all shadow-xs cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white cursor-pointer"
          >
            Apagar
          </button>
        </div>

        {/* Confirm Button */}
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={() => verifyPin(pin)}
            disabled={pin.length < 4}
            className="w-full py-2.5 px-4 bg-[#452267] hover:opacity-90 disabled:opacity-40 text-white text-xs font-bold rounded-2xl transition-all shadow-md btn-interactive cursor-pointer"
          >
            Confirmar Desbloqueio
          </button>
        </div>
      </div>
    </div>
  );
};
