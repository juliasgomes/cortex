import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CortexLogo } from '../common/CortexLogo';
import {
  Lock,
  Delete,
  ShieldCheck,
  Unlock,
  AlertCircle,
} from 'lucide-react';

interface MobileLockScreenProps {
  onUnlocked?: () => void;
}

export const MobileLockScreen: React.FC<MobileLockScreenProps> = ({ onUnlocked }) => {
  const { unlockWithPin, settings } = useClinic();
  const configuredPin = settings.securityPin || '1234';
  const expectedLength = configuredPin.length; // 4, 5, or 6 digits

  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Physical keyboard and numpad support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < expectedLength) {
          handleDigitPress(e.key);
        }
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (pin.length >= 4) {
          handleVerify(pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, expectedLength]);

  const handleDigitPress = (digit: string) => {
    setErrorMsg(null);
    if (pin.length < expectedLength) {
      const nextPin = pin + digit;
      setPin(nextPin);
      // Validate ONLY when reaching the exact configured PIN length (4, 5, or 6)
      if (nextPin.length === expectedLength) {
        const success = unlockWithPin(nextPin);
        if (success) {
          if (onUnlocked) onUnlocked();
        } else {
          setErrorMsg('PIN incorreto. Tente novamente.');
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg(null);
    setPin('');
  };

  const handleVerify = (code: string) => {
    if (code.length < 4) {
      setErrorMsg(`Digite o PIN completo de ${expectedLength} dígitos.`);
      return;
    }
    const success = unlockWithPin(code);
    if (success) {
      if (onUnlocked) onUnlocked();
    } else {
      setErrorMsg('PIN incorreto. Tente novamente.');
      setTimeout(() => setPin(''), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#452267] text-white flex flex-col justify-between p-6 select-none animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col items-center pt-4">
        <CortexLogo size="lg" variant="light" showWordmark={true} />
      </div>

      {/* Center PIN & Keypad Container */}
      <div className="w-full max-w-xs mx-auto flex flex-col items-center">
        {/* Lock indicator */}
        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 shadow-inner">
          <Lock className="w-7 h-7 text-[#ded6f4]" />
        </div>

        <h2 className="text-base font-bold text-white mb-1">
          Desbloquear Consultório
        </h2>
        <p className="text-xs text-[#ded6f4]/80 text-center mb-5">
          Digite seu PIN de segurança ({expectedLength} dígitos) para acessar
        </p>

        {/* PIN Dots Display matching exact configured length (4, 5, or 6) */}
        <div className="flex items-center gap-3 mb-4 h-8">
          {Array.from({ length: expectedLength }).map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                  isFilled
                    ? 'bg-white border-white scale-110 shadow-sm shadow-white/50'
                    : 'border-white/40 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-[11px] text-rose-300 font-semibold flex items-center gap-1.5 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numeric On-Screen Keypad (1 to 9, 0, Backspace, Clear) */}
        <div className="grid grid-cols-3 gap-3 w-full mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 active:scale-95 border border-white/10 text-xl font-bold font-mono text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              {digit}
            </button>
          ))}

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-semibold text-[#ded6f4] flex items-center justify-center transition-all cursor-pointer"
          >
            Limpar
          </button>

          {/* Zero */}
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 active:scale-95 border border-white/10 text-xl font-bold font-mono text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Apagar dígito"
          >
            <Delete className="w-5 h-5 text-[#ded6f4]" />
          </button>
        </div>

        {/* Explicit Confirm Button (Replacing Biometrics completely) */}
        <button
          type="button"
          onClick={() => handleVerify(pin)}
          disabled={pin.length < 4}
          className="w-full py-3 px-4 bg-white hover:bg-slate-100 disabled:opacity-40 text-[#452267] font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer btn-interactive"
        >
          <Unlock className="w-4 h-4 text-[#452267]" />
          <span>Confirmar Desbloqueio</span>
        </button>
      </div>

      {/* Security Footer Badges */}
      <div className="flex flex-col items-center text-center pb-2">
        <div className="inline-flex items-center gap-3 text-[11px] font-medium text-[#ded6f4] bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Criptografia 256-bit
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            CFP &amp; LGPD
          </span>
        </div>
      </div>
    </div>
  );
};
