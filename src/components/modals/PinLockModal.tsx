import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CortexLogo } from '../common/CortexLogo';
import { Lock, Unlock, Delete } from 'lucide-react';

export const PinLockModal: React.FC = () => {
  const { isLockScreenActive, unlockWithPin, settings } = useClinic();
  const configuredPin = settings.securityPin || '1234';
  const expectedLength = configuredPin.length; // 4 to 6 digits

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (isLockScreenActive) {
      setPin('');
      setErrorMsg('');
    }
  }, [isLockScreenActive]);

  // Handle keyboard events when lock screen is active
  useEffect(() => {
    if (!isLockScreenActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < expectedLength) {
          handleDigit(e.key);
        }
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleUnlock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLockScreenActive, pin, expectedLength]);

  if (!isLockScreenActive) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= expectedLength) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMsg('');
    if (nextPin.length === expectedLength) {
      // Attempt unlock only when exact configured length is reached
      const success = unlockWithPin(nextPin);
      if (!success) {
        setIsShaking(true);
        setErrorMsg('PIN incorreto. Tente novamente.');
        setTimeout(() => {
          setIsShaking(false);
          setPin('');
        }, 600);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleUnlock = () => {
    if (pin.length === 0) return;
    const success = unlockWithPin(pin);
    if (!success) {
      setIsShaking(true);
      setErrorMsg('PIN incorreto. Verifique sua senha.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#452267]/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className={`bg-white rounded-3xl max-w-sm w-full p-8 border border-slate-200 shadow-2xl text-center space-y-6 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        <div className="flex justify-center">
          <CortexLogo size="md" showWordmark={true} />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#452267] text-xs font-bold border border-purple-100">
            <Lock className="w-3.5 h-3.5 text-[#452267]" />
            <span>Consultório em Modo Sigilo</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Acesso Bloqueado
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Digite seu PIN de {expectedLength} dígitos para visualizar prontuários e a agenda com sigilo profissional.
          </p>
        </div>

        {/* Dynamic PIN indicator dots matching exact length */}
        <div className="flex items-center justify-center gap-3.5 py-2">
          {Array.from({ length: expectedLength }).map((_, index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                  isFilled
                    ? 'bg-[#452267] border-[#452267] scale-110 shadow-xs'
                    : 'bg-[#faf5ec] border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-xl animate-in fade-in">
            {errorMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-13 rounded-2xl bg-[#faf5ec] hover:bg-slate-100 active:scale-95 text-slate-800 text-lg font-bold font-mono transition-all border border-slate-200 shadow-2xs cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-13 rounded-2xl bg-white hover:bg-rose-50 active:scale-95 text-slate-500 hover:text-rose-600 text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
            title="Limpar PIN"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl bg-[#faf5ec] hover:bg-slate-100 active:scale-95 text-slate-800 text-lg font-bold font-mono transition-all border border-slate-200 shadow-2xs cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 rounded-2xl bg-white hover:bg-slate-100 active:scale-95 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all border border-slate-200 cursor-pointer"
            title="Apagar último dígito"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleUnlock}
          disabled={pin.length < expectedLength}
          className="w-full py-3 bg-[#452267] hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-[#452267]/20 flex items-center justify-center gap-2 cursor-pointer btn-interactive"
        >
          <Unlock className="w-4 h-4 text-white" />
          <span>Desbloquear Consultório</span>
        </button>
      </div>
    </div>
  );
};
